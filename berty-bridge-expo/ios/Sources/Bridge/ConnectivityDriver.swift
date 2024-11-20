//
//  ConnectivityDriver.swift
//  Berty
//
//  Created by u on 01/02/2023.
//

import SystemConfiguration
import CoreBluetooth
import CoreTelephony
import Foundation
import Bertybridge
import Network

class ConnectivityDriver: NSObject, BertybridgeIConnectivityDriverProtocol, CBCentralManagerDelegate {
    let logger: BertyLogger = BertyLogger("tech.berty.ConnectivityDriver")
    let queue = DispatchQueue.global(qos: .background)
    let pathMonitor = NWPathMonitor()
    var centralManager: CBCentralManager!

    var state: BertybridgeConnectivityInfo
    var handlers: [BertybridgeIConnectivityHandlerProtocol] = []

    override init() {
        self.logger.debug("Init")
      
        self.state = BertybridgeConnectivityInfo()!

        super.init()
      
        self.centralManager = CBCentralManager(delegate: self, queue: nil)

        self.pathMonitor.pathUpdateHandler = { [weak self] path in
            self!.logger.debug("Network state changed")
          
            self!.updateNetworkState(path)

            for handler in self!.handlers {
                handler.handleConnectivityUpdate(self!.state)
            }
        }
        self.pathMonitor.start(queue: self.queue)
    }

    func updateNetworkState(_ info: NWPath) {
        self.state.setState(info.status == .satisfied ? BertybridgeConnectivityStateOn : BertybridgeConnectivityStateOff)
        self.state.setMetering(BertybridgeConnectivityStateUnknown)
        self.state.setNetType(BertybridgeConnectivityNetUnknown)
        self.state.setCellularType(BertybridgeConnectivityCellularUnknown)

        if info.status != .satisfied {
            return
        }

        if #available(iOS 13.0, *) {
            self.state.setMetering(info.isConstrained ? BertybridgeConnectivityStateOn : BertybridgeConnectivityStateOff)
        }

        if let interface = self.pathMonitor.currentPath.availableInterfaces.first {
            switch interface.type {
                case .wifi:
                    self.state.setNetType(BertybridgeConnectivityNetWifi)
                case .cellular:
                    self.state.setNetType(BertybridgeConnectivityNetCellular)
                    self.state.setCellularType(ConnectivityDriver.getCellularType())
                case .wiredEthernet:
                    self.state.setNetType(BertybridgeConnectivityNetEthernet)
                default:
                    self.state.setNetType(BertybridgeConnectivityNetUnknown)
            }
        }
    }
  
    static func getCellularType() -> Int {
        let networkInfo = CTTelephonyNetworkInfo()

        guard let carrierType = networkInfo.serviceCurrentRadioAccessTechnology?.first?.value else {
            return BertybridgeConnectivityCellularNone
        }

        switch carrierType {
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
                if #available(iOS 14.1, *) {
                    if carrierType == CTRadioAccessTechnologyNRNSA
                    || carrierType == CTRadioAccessTechnologyNR {
                        return BertybridgeConnectivityCellular5G
                    }
                }

                return BertybridgeConnectivityCellularUnknown
        }
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        self.logger.debug("Bluetooth state changed")

        switch central.state {
            case .poweredOn:
                self.state.setBluetooth(BertybridgeConnectivityStateOn)
            case .poweredOff,
                 .unsupported,
                 .unauthorized,
                 .resetting:
                self.state.setBluetooth(BertybridgeConnectivityStateOff)
            case .unknown:
                self.state.setBluetooth(BertybridgeConnectivityStateUnknown)
            @unknown default:
                self.state.setBluetooth(BertybridgeConnectivityStateUnknown)
        }

        for handler in self.handlers {
            handler.handleConnectivityUpdate(self.state)
        }
    }

    public func getCurrentState() -> BertybridgeConnectivityInfo? {
        return self.state
    }

    public func register(_ handler: BertybridgeIConnectivityHandlerProtocol?) {
        if (handler != nil) {
            self.handlers.append(handler!)
        }
    }
}
