//
//  ConnectivityDriver.swift
//  Berty
//
//  Created by u on 01/02/2023.
//

import Foundation
import UIKit
import Network
import SystemConfiguration
import CoreTelephony
import CoreBluetooth
import Bertybridge

// Bridges iOS network and Bluetooth state to Go's netmanager.
//
// Network reachability comes from NWPathMonitor, with an SCNetworkReachability
// fallback for iOS < 12. Bluetooth state is observed through a CBCentralManager we
// own (the expo bridge has no shared BLE driver to borrow one from); we keep a
// strong reference so it is not deallocated and suppress the system power alert
// since we only observe state.
//
// The connectivity constants (state/net/cellular) are exported by the Bertybridge
// framework from Go's netmanager/connectivity.go — never redefine them locally.
class ConnectivityDriver: NSObject, BertybridgeIConnectivityDriverProtocol {
    let logger = BertyLogger("tech.berty.connectivity")

    private var pathMonitor: NWPathMonitor?
    private let monitorQueue = DispatchQueue(label: "tech.berty.connectivity.monitor")

    // Owned manager: kept as a strong reference so it is not deallocated.
    private var centralManager: CBCentralManager?

    private let networkInfo = CTTelephonyNetworkInfo()

    private var isMonitoring = false
    private var currentPath: NWPath?
    private var bluetoothState: CBManagerState = .unknown

    // Thread-safe handler storage. Go callbacks run on a dedicated serial queue
    // (not DispatchQueue.global(), which causes stack-alignment issues in the Go
    // runtime) when the app is backgrounded.
    private let handlerQueue = DispatchQueue(label: "tech.berty.connectivity.handlers", attributes: .concurrent)
    private let goCallbackQueue = DispatchQueue(label: "tech.berty.connectivity.go-callbacks")
    private var handlers: [BertybridgeIConnectivityHandlerProtocol] = []

    override init() {
        super.init()
        self.startMonitoring()
    }

    // MARK: - Monitoring lifecycle

    func startMonitoring() {
        guard !self.isMonitoring else { return }
        self.isMonitoring = true

        if #available(iOS 12.0, *) {
            self.setupPathMonitor()
        }
        self.setupBluetoothMonitoring()

        self.logger.info("Started connectivity monitoring")
    }

    func stopMonitoring() {
        guard self.isMonitoring else { return }
        self.isMonitoring = false

        if #available(iOS 12.0, *) {
            self.pathMonitor?.cancel()
            self.pathMonitor = nil
        }
        self.centralManager = nil

        self.logger.info("Stopped connectivity monitoring")
    }

    // MARK: - BertybridgeIConnectivityDriverProtocol

    public func getCurrentState() -> BertybridgeConnectivityInfo? {
        return self.buildCurrentState()
    }

    public func register(_ handler: BertybridgeIConnectivityHandlerProtocol?) {
        guard let handler = handler else { return }

        self.handlerQueue.async(flags: .barrier) { [weak self] in
            self?.handlers.append(handler)
        }

        // Notify the new handler of the current state immediately.
        handler.handleConnectivityUpdate(self.buildCurrentState())
    }

    // MARK: - State

    private func buildCurrentState() -> BertybridgeConnectivityInfo {
        let info = BertybridgeConnectivityInfo()!

        if #available(iOS 12.0, *), let path = self.currentPath {
            info.setState(path.status == .satisfied ? BertybridgeConnectivityStateOn : BertybridgeConnectivityStateOff)

            if #available(iOS 13.0, *) {
                info.setMetering(path.isConstrained ? BertybridgeConnectivityStateOn : BertybridgeConnectivityStateOff)
            } else {
                info.setMetering(BertybridgeConnectivityStateUnknown)
            }

            if path.usesInterfaceType(.wifi) {
                info.setNetType(BertybridgeConnectivityNetWifi)
            } else if path.usesInterfaceType(.cellular) {
                info.setNetType(BertybridgeConnectivityNetCellular)
                info.setCellularType(self.getCellularGeneration())
            } else if path.usesInterfaceType(.wiredEthernet) {
                info.setNetType(BertybridgeConnectivityNetEthernet)
            } else {
                info.setNetType(BertybridgeConnectivityNetUnknown)
            }
        } else {
            // Fallback for iOS < 12
            info.setState(self.isConnectedLegacy() ? BertybridgeConnectivityStateOn : BertybridgeConnectivityStateOff)
            info.setMetering(BertybridgeConnectivityStateUnknown)
            info.setNetType(self.getNetworkTypeLegacy())
            info.setCellularType(BertybridgeConnectivityCellularUnknown)
        }

        // Read Bluetooth state directly from the live manager for the freshest value.
        let state = self.centralManager?.state ?? self.bluetoothState
        switch state {
        case .poweredOn:
            info.setBluetooth(BertybridgeConnectivityStateOn)
        case .poweredOff:
            info.setBluetooth(BertybridgeConnectivityStateOff)
        default:
            info.setBluetooth(BertybridgeConnectivityStateUnknown)
        }

        return info
    }

    private func notifyHandlers() {
        // Read applicationState on the main thread before entering handlerQueue, to
        // avoid a sync hop to main from within the queue (deadlock risk).
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let isBackground = UIApplication.shared.applicationState == .background

            self.handlerQueue.async { [weak self] in
                guard let self = self else { return }
                let state = self.buildCurrentState()
                let handlers = self.handlers

                if isBackground {
                    // Background: hand off to Go on the dedicated serial queue.
                    self.goCallbackQueue.async {
                        handlers.forEach { $0.handleConnectivityUpdate(state) }
                    }
                } else {
                    DispatchQueue.main.async {
                        handlers.forEach { $0.handleConnectivityUpdate(state) }
                    }
                }
            }
        }
    }

    // MARK: - Network monitoring

    @available(iOS 12.0, *)
    private func setupPathMonitor() {
        let monitor = NWPathMonitor()
        monitor.pathUpdateHandler = { [weak self] path in
            self?.handlePathUpdate(path)
        }
        monitor.start(queue: self.monitorQueue)
        self.pathMonitor = monitor
    }

    @available(iOS 12.0, *)
    private func handlePathUpdate(_ path: NWPath) {
        self.logger.info("Network path updated: status=\(path.status), wifi=\(path.usesInterfaceType(.wifi)), cellular=\(path.usesInterfaceType(.cellular))")
        self.currentPath = path
        self.notifyHandlers()
    }

    // MARK: - Bluetooth monitoring

    private func setupBluetoothMonitoring() {
        guard self.centralManager == nil else { return }

        // Suppress the system power alert since we only observe state.
        self.centralManager = CBCentralManager(delegate: self, queue: nil, options: [CBCentralManagerOptionShowPowerAlertKey: false])
    }

    // MARK: - Cellular

    private func getCellularGeneration() -> Int {
        let technology: String?
        if #available(iOS 12.0, *) {
            technology = self.networkInfo.serviceCurrentRadioAccessTechnology?.values.first
        } else {
            technology = self.networkInfo.currentRadioAccessTechnology
        }
        guard let technology = technology else {
            return BertybridgeConnectivityCellularNone
        }
        return self.mapRadioAccessTechnology(technology)
    }

    private func mapRadioAccessTechnology(_ technology: String) -> Int {
        switch technology {
        case CTRadioAccessTechnologyGPRS,
             CTRadioAccessTechnologyEdge,
             CTRadioAccessTechnologyCDMA1x:
            return BertybridgeConnectivityCellular2G

        case CTRadioAccessTechnologyWCDMA,
             CTRadioAccessTechnologyHSDPA,
             CTRadioAccessTechnologyHSUPA,
             CTRadioAccessTechnologyCDMAEVDORev0,
             CTRadioAccessTechnologyCDMAEVDORevA,
             CTRadioAccessTechnologyCDMAEVDORevB,
             CTRadioAccessTechnologyeHRPD:
            return BertybridgeConnectivityCellular3G

        case CTRadioAccessTechnologyLTE:
            return BertybridgeConnectivityCellular4G

        default:
            if #available(iOS 14.1, *),
               technology == CTRadioAccessTechnologyNRNSA || technology == CTRadioAccessTechnologyNR {
                return BertybridgeConnectivityCellular5G
            }
            return BertybridgeConnectivityCellularUnknown
        }
    }

    // MARK: - Legacy support (iOS < 12)

    private func isConnectedLegacy() -> Bool {
        guard let flags = self.legacyReachabilityFlags() else { return false }
        return flags.contains(.reachable) && !flags.contains(.connectionRequired)
    }

    private func getNetworkTypeLegacy() -> Int {
        guard let flags = self.legacyReachabilityFlags() else {
            return BertybridgeConnectivityNetUnknown
        }
        if flags.contains(.isWWAN) {
            return BertybridgeConnectivityNetCellular
        } else if flags.contains(.reachable) {
            return BertybridgeConnectivityNetWifi
        }
        return BertybridgeConnectivityNetUnknown
    }

    private func legacyReachabilityFlags() -> SCNetworkReachabilityFlags? {
        var zeroAddress = sockaddr_in()
        zeroAddress.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)
        zeroAddress.sin_family = sa_family_t(AF_INET)

        let reachability = withUnsafePointer(to: &zeroAddress) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) { zeroSockAddress in
                SCNetworkReachabilityCreateWithAddress(nil, zeroSockAddress)
            }
        }
        guard let reachability = reachability else { return nil }

        var flags = SCNetworkReachabilityFlags()
        guard SCNetworkReachabilityGetFlags(reachability, &flags) else { return nil }
        return flags
    }
}

// MARK: - CBCentralManagerDelegate

extension ConnectivityDriver: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        self.logger.info("Bluetooth state changed: \(central.state.rawValue)")
        self.bluetoothState = central.state
        self.notifyHandlers()
    }
}
