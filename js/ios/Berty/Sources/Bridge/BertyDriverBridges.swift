import Foundation
import Bertybridge

// MARK: - Proximity/BLE Driver Bridge
// This is the main new functionality - bridges BLE driver to Go's proximity transport

@objc(BertyProximityDriverBridge)
public class BertyProximityDriverBridge: NSObject, BertybridgeProximityDriverProtocol {
    private let bleDriver = BertyBLEDriver.shared
    private let logger = BertyLogger("tech.berty.proximity.bridge")
    private var transport: (any BertybridgeProximityTransportProtocol)?
    private var localPeerID: String?

    @objc public func closeConn(withPeer remotePID: String?) {
        guard let remotePID = remotePID else { return }
        bleDriver.disconnectByRemotePID(remotePID)
    }

    @objc public func defaultAddr() -> String {
        // Must return a valid multiaddr format matching Go's ble.DefaultAddr constant
        return "/ble/Qmeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    }

    @objc public func dialPeer(_ remotePID: String?) -> Bool {
        // Match Android behavior: dialPeer returns true if the peer is already connected
        // It does NOT initiate new connections - those happen through discovery
        guard let remotePID = remotePID else { return false }
        return bleDriver.isPeerConnected(remotePID)
    }

    @objc public func protocolCode() -> Int {
        return 0x0042 // BLE protocol code - matches Android
    }

    @objc public func protocolName() -> String {
        return "ble"
    }

    @objc public func send(toPeer remotePID: String?, payload: Data?) -> Bool {
        guard let remotePID = remotePID,
              let payload = payload else { return false }

        do {
            try bleDriver.sendDataToPeer(payload, remotePID: remotePID)
            return true
        } catch {
            logger.error("Failed to send to peer \(remotePID): \(error)")
            return false
        }
    }

    @objc public func start(_ localPID: String?) {
        guard let localPID = localPID else {
            logger.error("Cannot start BLE driver without local PID")
            return
        }

        // Get the proximity transport from Go (matching Android behavior)
        // This MUST be done in start() - Go doesn't call registerTransport()
        self.transport = BertybridgeGetProximityTransport("ble")

        self.localPeerID = localPID
        bleDriver.setLocalPID(localPID)
        bleDriver.delegate = self

        do {
            try bleDriver.startAdvertising()
            try bleDriver.startScanning()
            logger.info("BLE proximity driver started")
        } catch {
            logger.error("Failed to start BLE driver: \(error)")
        }
    }

    @objc public func stop() {
        bleDriver.stopAdvertising()
        bleDriver.stopScanning()
        bleDriver.delegate = nil
        logger.info("BLE proximity driver stopped")
    }

    @objc public func registerTransport(_ transport: BertybridgeProximityTransport?) {
        self.transport = transport
    }
}

// MARK: - BLE Driver Delegate

extension BertyProximityDriverBridge: BertyBLEDriverDelegate {
    func bleDriver(_ driver: BertyBLEDriver, didDiscoverPeer peer: BertyBLEPeer) {
        _ = transport?.handleFoundPeer(peer.id)
    }

    func bleDriver(_ driver: BertyBLEDriver, didConnectToPeer peerId: String) {
        // Only call handleFoundPeer if peerId is a valid Berty PID format
        let isValidBertyPID = peerId.hasPrefix("12D3KooW") || peerId.hasPrefix("Qm")
        if isValidBertyPID {
            _ = transport?.handleFoundPeer(peerId)
        }
    }

    func bleDriver(_ driver: BertyBLEDriver, didDisconnectFromPeer peerId: String, error: Error?) {
        transport?.handleLostPeer(peerId)
    }

    func bleDriver(_ driver: BertyBLEDriver, didReceiveData data: Data, fromPeer peerId: String) {
        transport?.receive(fromPeer: peerId, payload: data)
    }

    func bleDriver(_ driver: BertyBLEDriver, didFailWithError error: BertyError) {
        transport?.log(3, message: error.localizedDescription)
    }
}

// MARK: - MDNS Locker Driver Bridge

@objc(BertyMDNSLockerDriverBridge)
public class BertyMDNSLockerDriverBridge: NSObject, BertybridgeNativeMDNSLockerDriverProtocol {
    private let mdnsLock = NSLock()

    @objc public func lock() {
        mdnsLock.lock()
    }

    @objc public func unlock() {
        mdnsLock.unlock()
    }
}

// MARK: - Background Task Implementation

class BertyBackgroundTask: NSObject, BertybridgeLifeCycleBackgroundTaskProtocol {
    private var taskIdentifier: String = ""
    private var isCompleted = false
    private var completion: () -> Void = {}

    convenience init(taskIdentifier: String, completion: @escaping () -> Void) {
        self.init()
        self.taskIdentifier = taskIdentifier
        self.completion = completion
    }

    @objc func cancel() {
        if !isCompleted {
            isCompleted = true
            completion()
        }
    }

    @objc func execute() -> Bool {
        // Perform background task
        // For now, just return true to indicate success
        if !isCompleted {
            isCompleted = true
            completion()
        }
        return true
    }
}
