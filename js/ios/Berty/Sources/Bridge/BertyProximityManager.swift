import Foundation
import CoreBluetooth
import Network
import UIKit

// MARK: - Connection Quality Enum
enum BertyConnectionQuality {
    case excellent
    case good
    case fair
    case poor
    case terrible
}

// MARK: - Proximity Manager Protocol
protocol BertyProximityManagerProtocol {
    func startDiscovery()
    func stopDiscovery()
    func startAdvertising()
    func stopAdvertising()
    func connectToPeer(_ peer: BertyProximityPeer) throws
    func disconnectFromPeer(_ peerId: String)
    func sendDataToPeer(_ data: Data, peerId: String) throws
    func getDiscoveredPeers() -> [BertyProximityPeer]
    func getConnectedPeers() -> [BertyProximityPeer]
}

// MARK: - Proximity Peer Model
struct BertyProximityPeer {
    let id: String
    let name: String?
    let deviceType: BertyDeviceType
    let transport: BertyTransportType
    let rssi: Int?
    let lastSeen: Date
    let isConnected: Bool
    let connectionQuality: BertyConnectionQuality
    let capabilities: Set<BertyPeerCapability>
    let metadata: [String: Any]

    init(
        id: String,
        name: String? = nil,
        deviceType: BertyDeviceType = .unknown,
        transport: BertyTransportType,
        rssi: Int? = nil,
        lastSeen: Date = Date(),
        isConnected: Bool = false,
        connectionQuality: BertyConnectionQuality = .poor,
        capabilities: Set<BertyPeerCapability> = [],
        metadata: [String: Any] = [:]
    ) {
        self.id = id
        self.name = name
        self.deviceType = deviceType
        self.transport = transport
        self.rssi = rssi
        self.lastSeen = lastSeen
        self.isConnected = isConnected
        self.connectionQuality = connectionQuality
        self.capabilities = capabilities
        self.metadata = metadata
    }
}

// MARK: - Supporting Types
enum BertyDeviceType {
    case phone
    case tablet
    case desktop
    case unknown
}

enum BertyTransportType {
    case bluetooth
    case wifi
    case cellular
    case multicast
    case relay
}

enum BertyPeerCapability {
    case messaging
    case fileTransfer
    case voiceCall
    case videoCall
    case groupChat
    case encryption
    case relay
}

// MARK: - Proximity Manager Delegate
protocol BertyProximityManagerDelegate: AnyObject {
    func proximityManager(_ manager: BertyProximityManager, didDiscoverPeer peer: BertyProximityPeer)
    func proximityManager(_ manager: BertyProximityManager, didLosePeer peerId: String)
    func proximityManager(_ manager: BertyProximityManager, didConnectToPeer peer: BertyProximityPeer)
    func proximityManager(_ manager: BertyProximityManager, didDisconnectFromPeer peerId: String, error: Error?)
    func proximityManager(_ manager: BertyProximityManager, didReceiveData data: Data, fromPeer peerId: String)
    func proximityManager(_ manager: BertyProximityManager, didFailWithError error: BertyError)
}

// MARK: - Proximity Manager
class BertyProximityManager: NSObject, BertyProximityManagerProtocol {
    static let shared = BertyProximityManager()

    weak var delegate: BertyProximityManagerDelegate?

    private let logger = BertyLogger("tech.berty.proximity")

    // Transport drivers
    private let bleDriver = BertyBLEDriver.shared
    private let networkDriver = BertyNetworkDriver.shared

    // State management
    private var isDiscovering = false
    private var isAdvertising = false

    private let peersLock = NSLock()
    private var _discoveredPeers: [String: BertyProximityPeer] = [:]
    private var _connectedPeers: [String: BertyProximityPeer] = [:]

    private var discoveredPeers: [String: BertyProximityPeer] {
        get {
            peersLock.lock()
            defer { peersLock.unlock() }
            return _discoveredPeers
        }
        set {
            peersLock.lock()
            defer { peersLock.unlock() }
            _discoveredPeers = newValue
        }
    }

    private var connectedPeers: [String: BertyProximityPeer] {
        get {
            peersLock.lock()
            defer { peersLock.unlock() }
            return _connectedPeers
        }
        set {
            peersLock.lock()
            defer { peersLock.unlock() }
            _connectedPeers = newValue
        }
    }

    // Discovery configuration
    private var discoveryConfig = BertyDiscoveryConfig()
    private let discoveryQueue = DispatchQueue(label: "BertyProximityDiscovery", qos: .userInitiated)

    // Peer management - use DispatchWorkItem instead of Timer to avoid RunLoop requirements
    private var peerTimeoutWork: [String: DispatchWorkItem] = [:]
    private let peerTimeoutInterval: TimeInterval = 30.0

    // Multicast discovery
    private var multicastBrowser: NWBrowser?
    private var multicastListener: NWListener?

    override init() {
        super.init()
        setupTransportDrivers()
    }

    deinit {
        stopDiscovery()
        stopAdvertising()
    }

    // MARK: - Setup

    private func setupTransportDrivers() {
        // Setup BLE driver delegate
        bleDriver.delegate = self

        // Setup network status monitoring
        networkDriver.setNetworkStatusCallback { [weak self] connectionType, isAvailable in
            self?.handleNetworkStatusChange(connectionType: connectionType, isAvailable: isAvailable)
        }
    }

    // MARK: - Discovery Management

    func startDiscovery() {
        guard !isDiscovering else { return }

        logger.info(" Starting peer discovery")
        isDiscovering = true

        // Start BLE discovery
        startBLEDiscovery()

        // Start multicast discovery if on WiFi
        if networkDriver.getCurrentConnectionType() == .wifi {
            startMulticastDiscovery()
        }

        // Start peer timeout monitoring
        startPeerTimeoutMonitoring()
    }

    func stopDiscovery() {
        guard isDiscovering else { return }

        logger.info(" Stopping peer discovery")
        isDiscovering = false

        // Stop all discovery mechanisms
        stopBLEDiscovery()
        stopMulticastDiscovery()
        stopPeerTimeoutMonitoring()

        // Clear discovered peers
        discoveredPeers.removeAll()
    }

    func startAdvertising() {
        guard !isAdvertising else { return }

        logger.info(" Starting advertising")
        isAdvertising = true

        // Start BLE advertising
        startBLEAdvertising()

        // Start multicast advertising if on WiFi
        if networkDriver.getCurrentConnectionType() == .wifi {
            if #available(iOS 16.0, *) {
                startMulticastAdvertising()
            }
        }
    }

    func stopAdvertising() {
        guard isAdvertising else { return }

        logger.info(" Stopping advertising")
        isAdvertising = false

        // Stop all advertising mechanisms
        stopBLEAdvertising()
        stopMulticastAdvertising()
    }

    // MARK: - BLE Discovery/Advertising

    private func startBLEDiscovery() {
        do {
            try bleDriver.startScanning()
            logger.info(" Started BLE discovery")
        } catch {
            logger.info(" Failed to start BLE discovery: \(error)")
            delegate?.proximityManager(self, didFailWithError: BertyError.bluetoothError(
                .bleScanningFailed,
                message: "Failed to start BLE discovery",
                underlyingError: error
            ))
        }
    }

    private func stopBLEDiscovery() {
        bleDriver.stopScanning()
        logger.info(" Stopped BLE discovery")
    }

    private func startBLEAdvertising() {
        do {
            try bleDriver.startAdvertising()
            logger.info(" Started BLE advertising")
        } catch {
            logger.info(" Failed to start BLE advertising: \(error)")
            delegate?.proximityManager(self, didFailWithError: BertyError.bluetoothError(
                .bleAdvertisingFailed,
                message: "Failed to start BLE advertising",
                underlyingError: error
            ))
        }
    }

    private func stopBLEAdvertising() {
        bleDriver.stopAdvertising()
        logger.info(" Stopped BLE advertising")
    }

    // MARK: - Multicast Discovery/Advertising

    @available(iOS 13.0, *)
    private func startMulticastDiscovery() {
        let parameters = NWParameters()
        parameters.includePeerToPeer = true

        let browserDescriptor = NWBrowser.Descriptor.bonjour(type: "_berty._tcp", domain: nil)
        multicastBrowser = NWBrowser(for: browserDescriptor, using: parameters)

        multicastBrowser?.stateUpdateHandler = { [weak self] state in
            self?.handleMulticastBrowserStateChange(state)
        }

        multicastBrowser?.browseResultsChangedHandler = { [weak self] results, changes in
            self?.handleMulticastBrowseResults(results, changes: changes)
        }

        multicastBrowser?.start(queue: discoveryQueue)
        logger.info(" Started multicast discovery")
    }

    private func stopMulticastDiscovery() {
        multicastBrowser?.cancel()
        multicastBrowser = nil
        logger.info(" Stopped multicast discovery")
    }

    @available(iOS 16.0, *)
    private func startMulticastAdvertising() {
        let parameters = NWParameters.tcp
        parameters.includePeerToPeer = true

        let service = NWListener.Service(name: "Berty-\(UIDevice.current.name)", type: "_berty._tcp")

        do {
            multicastListener = try NWListener(service: service, using: parameters)

            multicastListener?.stateUpdateHandler = { [weak self] state in
                self?.handleMulticastListenerStateChange(state)
            }

            multicastListener?.newConnectionHandler = { [weak self] connection in
                self?.handleMulticastNewConnection(connection)
            }

            multicastListener?.start(queue: discoveryQueue)
            logger.info(" Started multicast advertising")
        } catch {
            logger.info(" Failed to start multicast advertising: \(error)")
        }
    }

    private func stopMulticastAdvertising() {
        multicastListener?.cancel()
        multicastListener = nil
        logger.info(" Stopped multicast advertising")
    }

    // MARK: - Multicast Handlers

    @available(iOS 13.0, *)
    private func handleMulticastBrowserStateChange(_ state: NWBrowser.State) {
        switch state {
        case .ready:
            logger.info(" Multicast browser ready")
        case .failed(let error):
            logger.info(" Multicast browser failed: \(error)")
        case .cancelled:
            logger.info(" Multicast browser cancelled")
        default:
            break
        }
    }

    @available(iOS 13.0, *)
    private func handleMulticastBrowseResults(_ results: Set<NWBrowser.Result>, changes: Set<NWBrowser.Result.Change>) {
        for change in changes {
            switch change {
            case .added(let result):
                handleMulticastPeerAdded(result)
            case .removed(let result):
                handleMulticastPeerRemoved(result)
            case .changed(_, let new, _):
                handleMulticastPeerChanged(new)
            case .identical:
                break
            @unknown default:
                break
            }
        }
    }

    @available(iOS 13.0, *)
    private func handleMulticastPeerAdded(_ result: NWBrowser.Result) {
        let peerId = result.endpoint.debugDescription
        let name = extractNameFromBonjourResult(result)

        let peer = BertyProximityPeer(
            id: peerId,
            name: name,
            deviceType: .unknown,
            transport: .multicast,
            isConnected: false,
            capabilities: [.messaging, .groupChat]
        )

        addDiscoveredPeer(peer)
    }

    @available(iOS 13.0, *)
    private func handleMulticastPeerRemoved(_ result: NWBrowser.Result) {
        let peerId = result.endpoint.debugDescription
        removeDiscoveredPeer(peerId)
    }

    @available(iOS 13.0, *)
    private func handleMulticastPeerChanged(_ result: NWBrowser.Result) {
        let peerId = result.endpoint.debugDescription
        updatePeerLastSeen(peerId)
    }

    @available(iOS 13.0, *)
    private func handleMulticastListenerStateChange(_ state: NWListener.State) {
        switch state {
        case .ready:
            logger.info(" Multicast listener ready")
        case .failed(let error):
            logger.info(" Multicast listener failed: \(error)")
        case .cancelled:
            logger.info(" Multicast listener cancelled")
        default:
            break
        }
    }

    @available(iOS 13.0, *)
    private func handleMulticastNewConnection(_ connection: NWConnection) {
        logger.info(" New multicast connection: \(connection)")

        // Handle incoming multicast connection
        connection.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                self?.logger.info(" Multicast connection ready")
            case .failed(let error):
                self?.logger.info(" Multicast connection failed: \(error)")
            default:
                break
            }
        }

        connection.start(queue: discoveryQueue)
    }

    private func extractNameFromBonjourResult(_ result: NWBrowser.Result) -> String? {
        if case .service(let name, _, _, _) = result.endpoint {
            return name
        }
        return nil
    }

    // MARK: - Peer Management

    private func addDiscoveredPeer(_ peer: BertyProximityPeer) {
        discoveredPeers[peer.id] = peer
        setupPeerTimeout(peerId: peer.id)

        logger.info(" Discovered peer: \(peer.id) (\(peer.transport))")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didDiscoverPeer: peer)
        }
    }

    private func removeDiscoveredPeer(_ peerId: String) {
        discoveredPeers.removeValue(forKey: peerId)
        clearPeerTimeout(peerId: peerId)

        logger.info(" Lost peer: \(peerId)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didLosePeer: peerId)
        }
    }

    private func updatePeerLastSeen(_ peerId: String) {
        guard var peer = discoveredPeers[peerId] else { return }

        peer = BertyProximityPeer(
            id: peer.id,
            name: peer.name,
            deviceType: peer.deviceType,
            transport: peer.transport,
            rssi: peer.rssi,
            lastSeen: Date(),
            isConnected: peer.isConnected,
            connectionQuality: peer.connectionQuality,
            capabilities: peer.capabilities,
            metadata: peer.metadata
        )

        discoveredPeers[peerId] = peer
        resetPeerTimeout(peerId: peerId)
    }

    // MARK: - Peer Timeout Management

    private func startPeerTimeoutMonitoring() {
        // Monitoring is handled per-peer in setupPeerTimeout
    }

    private func stopPeerTimeoutMonitoring() {
        for work in peerTimeoutWork.values {
            work.cancel()
        }
        peerTimeoutWork.removeAll()
    }

    private func setupPeerTimeout(peerId: String) {
        clearPeerTimeout(peerId: peerId)

        // Use DispatchWorkItem instead of Timer - works without active RunLoop
        let work = DispatchWorkItem { [weak self] in
            self?.handlePeerTimeout(peerId: peerId)
        }
        peerTimeoutWork[peerId] = work
        discoveryQueue.asyncAfter(deadline: .now() + peerTimeoutInterval, execute: work)
    }

    private func clearPeerTimeout(peerId: String) {
        peerTimeoutWork[peerId]?.cancel()
        peerTimeoutWork.removeValue(forKey: peerId)
    }

    private func resetPeerTimeout(peerId: String) {
        setupPeerTimeout(peerId: peerId)
    }

    private func handlePeerTimeout(peerId: String) {
        logger.info(" Peer timeout: \(peerId)")
        removeDiscoveredPeer(peerId)
    }

    // MARK: - Connection Management

    func connectToPeer(_ peer: BertyProximityPeer) throws {
        guard !peer.isConnected else {
            throw BertyError.connectivityError(
                .peerConnectionTimeout,
                message: "Peer is already connected: \(peer.id)"
            )
        }

        switch peer.transport {
        case .bluetooth:
            try connectViaBluetooth(peer)
        case .multicast, .wifi:
            try connectViaNetwork(peer)
        default:
            throw BertyError.connectivityError(
                .peerDiscoveryFailed,
                message: "Unsupported transport type: \(peer.transport)"
            )
        }
    }

    private func connectViaBluetooth(_ peer: BertyProximityPeer) throws {
        try bleDriver.connectToPeer(peer.id)
    }

    private func connectViaNetwork(_ peer: BertyProximityPeer) throws {
        // Implement network-based connection
        logger.info(" Connecting via network to peer: \(peer.id)")

        // This would establish a direct network connection
        // For now, we'll simulate success
        let connectedPeer = BertyProximityPeer(
            id: peer.id,
            name: peer.name,
            deviceType: peer.deviceType,
            transport: peer.transport,
            rssi: peer.rssi,
            lastSeen: peer.lastSeen,
            isConnected: true,
            connectionQuality: .good,
            capabilities: peer.capabilities,
            metadata: peer.metadata
        )

        connectedPeers[peer.id] = connectedPeer

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didConnectToPeer: connectedPeer)
        }
    }

    func disconnectFromPeer(_ peerId: String) {
        guard let peer = connectedPeers[peerId] else { return }

        switch peer.transport {
        case .bluetooth:
            bleDriver.disconnectFromPeer(peerId)
        case .multicast, .wifi:
            disconnectFromNetworkPeer(peerId)
        default:
            break
        }

        connectedPeers.removeValue(forKey: peerId)

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didDisconnectFromPeer: peerId, error: nil)
        }
    }

    private func disconnectFromNetworkPeer(_ peerId: String) {
        logger.info(" Disconnecting from network peer: \(peerId)")
        // Implement network disconnection logic
    }

    // MARK: - Data Transfer

    func sendDataToPeer(_ data: Data, peerId: String) throws {
        guard let peer = connectedPeers[peerId] else {
            throw BertyError.connectivityError(
                .peerConnectionTimeout,
                message: "Peer not connected: \(peerId)"
            )
        }

        switch peer.transport {
        case .bluetooth:
            try bleDriver.sendData(data, toPeer: peerId)
        case .multicast, .wifi:
            try sendDataViaNetwork(data, toPeer: peerId)
        default:
            throw BertyError.connectivityError(
                .peerDiscoveryFailed,
                message: "Unsupported transport for data transfer: \(peer.transport)"
            )
        }
    }

    private func sendDataViaNetwork(_ data: Data, toPeer peerId: String) throws {
        logger.info(" Sending \(data.count) bytes via network to peer: \(peerId)")
        // Implement network data sending
    }

    // MARK: - Public Getters

    func getDiscoveredPeers() -> [BertyProximityPeer] {
        return Array(discoveredPeers.values)
    }

    func getConnectedPeers() -> [BertyProximityPeer] {
        return Array(connectedPeers.values)
    }

    // MARK: - Network Status Handling

    private func handleNetworkStatusChange(connectionType: BertyConnectionType, isAvailable: Bool) {
        logger.info(" Network status changed - Type: \(connectionType), Available: \(isAvailable)")

        if connectionType == .wifi && isAvailable && isDiscovering {
            // Start multicast discovery when WiFi becomes available
            startMulticastDiscovery()
        } else if connectionType != .wifi {
            // Stop multicast discovery when not on WiFi
            stopMulticastDiscovery()
        }

        if connectionType == .wifi && isAvailable && isAdvertising {
            // Start multicast advertising when WiFi becomes available
            if #available(iOS 16.0, *) {
                startMulticastAdvertising()
            }
        } else if connectionType != .wifi {
            // Stop multicast advertising when not on WiFi
            stopMulticastAdvertising()
        }
    }

    // MARK: - Configuration

    func updateDiscoveryConfig(_ config: BertyDiscoveryConfig) {
        discoveryConfig = config

        // Apply new configuration
        if isDiscovering {
            stopDiscovery()
            startDiscovery()
        }
    }

    // MARK: - Debug Information

    func getDebugInfo() -> [String: Any] {
        var info: [String: Any] = [:]

        info["isDiscovering"] = isDiscovering
        info["isAdvertising"] = isAdvertising
        info["discoveredPeersCount"] = discoveredPeers.count
        info["connectedPeersCount"] = connectedPeers.count
        info["peerTimeoutsActive"] = peerTimeoutWork.count

        let discoveredPeersInfo = discoveredPeers.values.map { peer in
            [
                "id": peer.id,
                "name": peer.name ?? "unknown",
                "transport": String(describing: peer.transport),
                "isConnected": peer.isConnected,
                "lastSeen": peer.lastSeen.timeIntervalSince1970,
                "rssi": peer.rssi ?? 0
            ]
        }
        info["discoveredPeers"] = discoveredPeersInfo

        let connectedPeersInfo = connectedPeers.values.map { peer in
            [
                "id": peer.id,
                "name": peer.name ?? "unknown",
                "transport": String(describing: peer.transport),
                "connectionQuality": String(describing: peer.connectionQuality)
            ]
        }
        info["connectedPeers"] = connectedPeersInfo

        info["networkType"] = String(describing: networkDriver.getCurrentConnectionType())
        info["bleEnabled"] = bleDriver.isBluetoothEnabled()

        return info
    }
}

// MARK: - Discovery Configuration
struct BertyDiscoveryConfig {
    let enableBluetooth: Bool
    let enableMulticast: Bool
    let enableRelay: Bool
    let discoveryInterval: TimeInterval
    let advertisingInterval: TimeInterval
    let peerTimeout: TimeInterval

    init(
        enableBluetooth: Bool = true,
        enableMulticast: Bool = true,
        enableRelay: Bool = false,
        discoveryInterval: TimeInterval = 10.0,
        advertisingInterval: TimeInterval = 5.0,
        peerTimeout: TimeInterval = 30.0
    ) {
        self.enableBluetooth = enableBluetooth
        self.enableMulticast = enableMulticast
        self.enableRelay = enableRelay
        self.discoveryInterval = discoveryInterval
        self.advertisingInterval = advertisingInterval
        self.peerTimeout = peerTimeout
    }
}

// MARK: - BLE Driver Delegate
extension BertyProximityManager: BertyBLEDriverDelegate {
    func bleDriver(_ driver: BertyBLEDriver, didDiscoverPeer peer: BertyBLEPeer) {
        let proximityPeer = BertyProximityPeer(
            id: peer.id,
            name: peer.name,
            deviceType: .phone, // Assume phone for BLE devices
            transport: .bluetooth,
            rssi: peer.rssi,
            lastSeen: peer.lastSeen,
            isConnected: peer.isConnected,
            connectionQuality: assessConnectionQuality(rssi: peer.rssi),
            capabilities: [.messaging, .encryption]
        )

        addDiscoveredPeer(proximityPeer)
    }

    func bleDriver(_ driver: BertyBLEDriver, didConnectToPeer peerId: String) {
        guard var peer = discoveredPeers[peerId] else { return }

        peer = BertyProximityPeer(
            id: peer.id,
            name: peer.name,
            deviceType: peer.deviceType,
            transport: peer.transport,
            rssi: peer.rssi,
            lastSeen: peer.lastSeen,
            isConnected: true,
            connectionQuality: peer.connectionQuality,
            capabilities: peer.capabilities,
            metadata: peer.metadata
        )

        connectedPeers[peerId] = peer

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didConnectToPeer: peer)
        }
    }

    func bleDriver(_ driver: BertyBLEDriver, didDisconnectFromPeer peerId: String, error: Error?) {
        connectedPeers.removeValue(forKey: peerId)

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didDisconnectFromPeer: peerId, error: error)
        }
    }

    func bleDriver(_ driver: BertyBLEDriver, didReceiveData data: Data, fromPeer peerId: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didReceiveData: data, fromPeer: peerId)
        }
    }

    func bleDriver(_ driver: BertyBLEDriver, didFailWithError error: BertyError) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.proximityManager(self, didFailWithError: error)
        }
    }

    private func assessConnectionQuality(rssi: Int) -> BertyConnectionQuality {
        switch rssi {
        case -30...0:
            return .excellent
        case -60...(-31):
            return .good
        case -80...(-61):
            return .fair
        default:
            return .poor
        }
    }
}

// MARK: - Berty Native Proximity Driver Bridge
@objc class BertyNativeProximityDriverBridge: NSObject {
    private let manager = BertyProximityManager.shared

    @objc func startDiscovery() {
        manager.startDiscovery()
    }

    @objc func stopDiscovery() {
        manager.stopDiscovery()
    }

    @objc func startAdvertising() {
        manager.startAdvertising()
    }

    @objc func stopAdvertising() {
        manager.stopAdvertising()
    }

    @objc func getPeerCount() -> Int {
        return manager.getDiscoveredPeers().count
    }

    @objc func getConnectedPeerCount() -> Int {
        return manager.getConnectedPeers().count
    }
}
