import Foundation
import CoreBluetooth
import UIKit

// MARK: - BLE Driver Protocol
protocol BertyBLEDriverProtocol {
    func startAdvertising() throws
    func stopAdvertising()
    func startScanning() throws
    func stopScanning()
    func connectToPeer(_ peerId: String) throws
    func disconnectFromPeer(_ peerId: String)
    func sendData(_ data: Data, toPeer peerId: String) throws
    func isBluetoothAvailable() -> Bool
    func isBluetoothEnabled() -> Bool
}

// MARK: - BLE Peer Model
struct BertyBLEPeer {
    let id: String
    let name: String?
    let rssi: Int
    let lastSeen: Date
    let isConnected: Bool
    let peripheral: CBPeripheral?
    let services: [String]
}

// MARK: - BLE Service Constants
struct BertyBLEConstants {
    static let serviceUUID = CBUUID(string: BertyConfiguration.bleServiceUUID)
    static let pidCharacteristicUUID = CBUUID(string: BertyConfiguration.blePIDCharacteristicUUID)
    static let writerCharacteristicUUID = CBUUID(string: BertyConfiguration.bleWriterCharacteristicUUID)
    static let cccDescriptorUUID = CBUUID(string: BertyConfiguration.bleCCCDescriptorUUID)

    // Legacy alias
    static let characteristicUUID = pidCharacteristicUUID

    static let eodMarker = BertyConfiguration.bleEODMarker
    // Safe conversion with fallback - avoid force unwrap crash
    static let eodMarkerData: Data = {
        guard let data = BertyConfiguration.bleEODMarker.data(using: .utf8) else {
            // Fallback to ASCII "EOD" if configuration is invalid
            return "EOD".data(using: .utf8) ?? Data()
        }
        return data
    }()
    static let maxDataLength = BertyConfiguration.bleMaxDataLength
    static let attHeaderSize = BertyConfiguration.bleATTHeaderSize
    static let connectionTimeout = BertyConfiguration.bleConnectionTimeout
    static let scanTimeout = BertyConfiguration.bleScanTimeout
    static let reconnectDelay = BertyConfiguration.bleReconnectDelay
    static let scanRestartInterval = BertyConfiguration.bleScanRestartInterval
}

// MARK: - BLE Driver Delegate
protocol BertyBLEDriverDelegate: AnyObject {
    func bleDriver(_ driver: BertyBLEDriver, didDiscoverPeer peer: BertyBLEPeer)
    func bleDriver(_ driver: BertyBLEDriver, didConnectToPeer peerId: String)
    func bleDriver(_ driver: BertyBLEDriver, didDisconnectFromPeer peerId: String, error: Error?)
    func bleDriver(_ driver: BertyBLEDriver, didReceiveData data: Data, fromPeer peerId: String)
    func bleDriver(_ driver: BertyBLEDriver, didFailWithError error: BertyError)
}

// MARK: - BLE Driver Implementation
class BertyBLEDriver: NSObject, BertyBLEDriverProtocol {
    static let shared = BertyBLEDriver()

    weak var delegate: BertyBLEDriverDelegate?

    private let logger = BertyLogger("tech.berty.ble")

    private var centralManager: CBCentralManager?
    private var peripheralManager: CBPeripheralManager?

    private var discoveredPeers: [String: BertyBLEPeer] = [:]
    private var connectedPeers: [String: CBPeripheral] = [:]
    private var peerCharacteristics: [String: CBCharacteristic] = [:]

    private var isAdvertising = false
    private var isScanning = false
    private var bluetoothState: CBManagerState = .unknown
    private var isBluetoothInitialized = false

    private let bluetoothStateCondition = NSCondition()
    private var bluetoothStateReady = false

    private let peripheralStateCondition = NSCondition()
    private var peripheralStateReady = false

    private let bleQueue = BertyQueueManager.shared.bleQueue

    private var connectionTimeoutWork: [String: DispatchWorkItem] = [:]
    private var handshakeTimeoutWork: [String: DispatchWorkItem] = [:]

    private var scanCycleWork: DispatchWorkItem?
    private let scanCycleInterval: TimeInterval = 12.0

    // Local peer ID for handshake
    private var localPID: String = ""

    // Service and characteristics for peripheral (server) mode
    private var bertyService: CBMutableService?
    private var pidCharacteristic: CBMutableCharacteristic?
    private var writerCharacteristic: CBMutableCharacteristic?

    // Track whether service has been added to avoid re-adding
    private var serviceAdded = false

    // Centrals subscribed to WRITER notifications (server mode)
    private var subscribedCentrals: [String: CBCentral] = [:]

    // Incoming PID buffer for server-side handshake (accumulates until EOD)
    private var incomingPIDBuffers: [String: Data] = [:]

    // Track handshake completion for server-side connections
    private var serverHandshakeComplete: [String: Bool] = [:]
    private var serverRemotePIDs: [String: String] = [:]

    // Data cache for messages received before handshake completion
    private var pendingDataCache: [String: [Data]] = [:]

    // Client-side: track WRITER characteristics for each connected peripheral
    private var peerWriterCharacteristics: [String: CBCharacteristic] = [:]

    // Client-side handshake state
    private var clientHandshakeComplete: [String: Bool] = [:]
    private var clientRemotePIDs: [String: String] = [:]

    // Client handshake state machine (instance variable, not static)
    private enum ClientHandshakeState {
        case idle, writingPID, writingEOD, readingPID, subscribing, complete
    }
    private var clientHandshakeStates: [String: ClientHandshakeState] = [:]

    // Notification queue management for server-side sends
    private let maxPendingNotifications = 100
    private var pendingNotifications: [(data: Data, central: CBCentral)] = []
    // Max pending data cache size per peer (64KB)
    private let maxPendingDataCacheSize = 64 * 1024
    private var isProcessingNotifications = false

    private let handshakeTimeout: TimeInterval = 30.0

    private let maxPIDBufferSize = 1024

    override init() {
        super.init()
        // Defer Bluetooth setup until actually needed to prevent early permission prompt
        // setupBluetooth() will be called lazily when needed
    }

    deinit {
        stopAdvertising()
        stopScanning()
        disconnectAllPeers()
    }

    // MARK: - Setup

    private func setupBluetooth() {
        guard !isBluetoothInitialized else { return }

        logger.info("Initializing Bluetooth managers")

        centralManager = CBCentralManager(
            delegate: self,
            queue: bleQueue,
            options: [
                CBCentralManagerOptionRestoreIdentifierKey: "tech.berty.central",
                CBCentralManagerOptionShowPowerAlertKey: true
            ]
        )
        peripheralManager = CBPeripheralManager(
            delegate: self,
            queue: bleQueue,
            options: [
                CBPeripheralManagerOptionRestoreIdentifierKey: "tech.berty.peripheral",
                CBPeripheralManagerOptionShowPowerAlertKey: true
            ]
        )
        isBluetoothInitialized = true
        logger.info("Bluetooth managers initialized")
    }

    private func ensureBluetoothInitialized() {
        if !isBluetoothInitialized {
            setupBluetooth()
        }
    }

    // MARK: - Public Interface

    func startAdvertising() throws {
        ensureBluetoothInitialized()

        bluetoothStateCondition.lock()
        if !bluetoothStateReady {
            logger.info("Waiting for Bluetooth state")
            let timedOut = !bluetoothStateCondition.wait(until: Date().addingTimeInterval(5.0))
            if timedOut {
                logger.info("Timed out waiting for Bluetooth state")
            } else {
                logger.info("Bluetooth state received: \(bluetoothState.rawValue)")
            }
        }
        bluetoothStateCondition.unlock()

        guard isBluetoothAvailable() && isBluetoothEnabled() else {
            throw BertyError.bluetoothError(
                .bluetoothUnavailable,
                message: "Bluetooth is not available or enabled (state: \(bluetoothState.rawValue))"
            )
        }

        guard !isAdvertising else { return }

        // Wait for peripheral manager to be powered on BEFORE dispatching to bleQueue
        // (because peripheralManagerDidUpdateState callback also runs on bleQueue)
        peripheralStateCondition.lock()
        if !peripheralStateReady {
                let timedOut = !peripheralStateCondition.wait(until: Date().addingTimeInterval(5.0))
            if timedOut {
                logger.info("Timed out waiting for peripheral manager")
            }
        }
        peripheralStateCondition.unlock()

        // Verify peripheral manager is actually powered on
        guard peripheralManager?.state == .poweredOn else {
            logger.info("Peripheral manager not powered on, cannot add service")
            return
        }

        bleQueue.async { [weak self] in
            guard let self = self else { return }
            self.setupPeripheralService()
        }
    }

    func stopAdvertising() {
        guard isAdvertising else { return }

        bleQueue.async { [weak self] in
            guard let self = self else { return }
            self.peripheralManager?.stopAdvertising()
            // Remove service so it can be re-added on next start
            if let service = self.bertyService {
                self.peripheralManager?.remove(service)
                self.serviceAdded = false
            }
            self.isAdvertising = false
            self.logger.info("Stopped advertising")
        }
    }

    func startScanning() throws {
        ensureBluetoothInitialized()

        bluetoothStateCondition.lock()
        if !bluetoothStateReady {
            logger.info("Waiting for Bluetooth state (scanning)")
            let timedOut = !bluetoothStateCondition.wait(until: Date().addingTimeInterval(5.0))
            if timedOut {
                logger.info("Timed out waiting for Bluetooth state (scanning)")
            }
        }
        bluetoothStateCondition.unlock()

        guard isBluetoothAvailable() && isBluetoothEnabled() else {
            throw BertyError.bluetoothError(
                .bluetoothUnavailable,
                message: "Bluetooth is not available or enabled (state: \(bluetoothState.rawValue))"
            )
        }
        guard !isScanning else { return }

        bleQueue.async { [weak self] in
            self?.startCentralScanning()
        }
    }

    func stopScanning() {
        guard isScanning else { return }

        bleQueue.async { [weak self] in
            self?.scanCycleWork?.cancel()
            self?.scanCycleWork = nil

            self?.centralManager?.stopScan()
            self?.isScanning = false
            self?.logger.info("Stopped scanning")
        }
    }

    func connectToPeer(_ peerId: String) throws {
        guard let peer = discoveredPeers[peerId] else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Peer not found: \(peerId)"
            )
        }

        guard let peripheral = peer.peripheral else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Peripheral not available for peer: \(peerId)"
            )
        }

        bleQueue.async { [weak self] in
            self?.connectToPeripheral(peripheral, peerId: peerId)
        }
    }

    func disconnectFromPeer(_ peerId: String) {
        bleQueue.async { [weak self] in
            guard let peripheral = self?.connectedPeers[peerId] else { return }
            self?.centralManager?.cancelPeripheralConnection(peripheral)
        }
    }

    /// Disconnect from a peer by their Berty PID (handles both client and server connections)
    func disconnectByRemotePID(_ remotePID: String) {
        bleQueue.async { [weak self] in
            guard let self = self else { return }

            // Check client-side connections
            if let peerId = self.clientRemotePIDs.first(where: { $0.value == remotePID })?.key,
               let peripheral = self.connectedPeers[peerId] {
                self.centralManager?.cancelPeripheralConnection(peripheral)
                return
            }

            // Check server-side connections - we can't disconnect a central, but we can clean up
            if let centralId = self.serverRemotePIDs.first(where: { $0.value == remotePID })?.key {
                self.removeServerPeer(centralId)
                // Notify delegate of disconnection
                DispatchQueue.main.async {
                    self.delegate?.bleDriver(self, didDisconnectFromPeer: remotePID, error: nil)
                }
            }
        }
    }

    func sendData(_ data: Data, toPeer peerId: String) throws {
        guard data.count <= BertyBLEConstants.maxDataLength else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Data too large: \(data.count) bytes (max: \(BertyBLEConstants.maxDataLength))"
            )
        }

        guard let characteristic = peerCharacteristics[peerId] else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "No characteristic available for peer: \(peerId)"
            )
        }

        guard characteristic.properties.contains(.write) || characteristic.properties.contains(.writeWithoutResponse) else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Characteristic does not support write for peer: \(peerId)"
            )
        }

        guard let peripheral = connectedPeers[peerId] else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Peer not connected: \(peerId)"
            )
        }

        bleQueue.async {
            peripheral.writeValue(data, for: characteristic, type: .withResponse)
        }
    }

    func isBluetoothAvailable() -> Bool {
        return bluetoothState != .unsupported
    }

    func isBluetoothEnabled() -> Bool {
        return bluetoothState == .poweredOn
    }

    func getCentralManager() -> CBCentralManager? {
        return centralManager
    }

    /// Set the local peer ID used in BLE handshake
    /// Must be called before startAdvertising()
    func setLocalPID(_ pid: String) {
        bleQueue.async { [weak self] in
            guard let self = self else { return }

            if self.isAdvertising {
                self.logger.info("Warning: setLocalPID called after advertising started - PID may not be used in existing connections")
            }

            if pid.isEmpty {
                self.logger.info("Warning: setLocalPID called with empty PID")
                return
            }

            self.localPID = pid
            self.logger.info("Local PID set for BLE handshake")
        }
    }

    /// Get the local peer ID
    func getLocalPID() -> String {
        return localPID
    }

    /// Send data to a peer via BLE (server mode - via WRITER notifications)
    func sendDataToSubscribedCentral(_ data: Data, centralId: String) throws {
        guard let writerChar = writerCharacteristic else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "WRITER characteristic not available"
            )
        }

        guard let central = subscribedCentrals[centralId] else {
            throw BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Central not subscribed: \(centralId)"
            )
        }

        bleQueue.async { [weak self] in
            guard let self = self else { return }
            self.sendChunkedNotification(data: data, to: central, via: writerChar)
        }
    }

    /// Send data to a peer by their PID (handles both server and client modes)
    func sendDataToPeer(_ data: Data, remotePID: String) throws {
        // Check if we're connected as server (they connected to us)
        if let centralId = serverRemotePIDs.first(where: { $0.value == remotePID })?.key {
            try sendDataToSubscribedCentral(data, centralId: centralId)
            return
        }

        // Check if we're connected as client (we connected to them)
        if let peripheral = connectedPeers.first(where: { clientRemotePIDs[$0.key] == remotePID })?.value {
            let peerId = peripheral.identifier.uuidString
            guard let writerChar = peerWriterCharacteristics[peerId] else {
                throw BertyError.bluetoothError(
                    .bleConnectionFailed,
                    message: "WRITER characteristic not found for peer"
                )
            }

            bleQueue.async {
                self.sendChunkedWrite(data: data, to: peripheral, via: writerChar)
            }
            return
        }

        throw BertyError.bluetoothError(
            .bleConnectionFailed,
            message: "Peer not connected: \(remotePID)"
        )
    }

    /// Check if peer is connected (either as server or client) with completed handshake
    func isPeerConnected(_ remotePID: String) -> Bool {
        // Check server-side connections - find the central ID for this PID
        if let centralId = serverRemotePIDs.first(where: { $0.value == remotePID })?.key {
            if serverHandshakeComplete[centralId] == true {
                return true
            }
        }
        // Check client-side connections - find the peer ID for this PID
        if let peerId = clientRemotePIDs.first(where: { $0.value == remotePID })?.key {
            if clientHandshakeComplete[peerId] == true {
                return true
            }
        }
        return false
    }

    // MARK: - Peripheral (Advertising) Implementation

    private func setupPeripheralService() {
        // Skip if service already added
        if serviceAdded {
            startPeripheralAdvertising()
            return
        }

        // Create the service
        bertyService = CBMutableService(type: BertyBLEConstants.serviceUUID, primary: true)

        // Create PID characteristic (for handshake - read/write)
        // Android expects: read returns [4-byte PSM][PID], write receives remote PID + EOD
        pidCharacteristic = CBMutableCharacteristic(
            type: BertyBLEConstants.pidCharacteristicUUID,
            properties: [.read, .write],
            value: nil,
            permissions: [.readable, .writeable]
        )

        // Create WRITER characteristic (for data transfer - write/notify)
        // Android expects: write receives data, notify sends data
        writerCharacteristic = CBMutableCharacteristic(
            type: BertyBLEConstants.writerCharacteristicUUID,
            properties: [.write, .notify],
            value: nil,
            permissions: [.writeable]
        )

        guard let pidChar = pidCharacteristic,
              let writerChar = writerCharacteristic,
              let service = bertyService else {
            logger.info("Failed to create BLE characteristics or service")
            return
        }

        // Add both characteristics to service
        service.characteristics = [pidChar, writerChar]

        // Add service to peripheral manager
        peripheralManager?.add(service)
    }

    private func startPeripheralAdvertising() {
        let pidSuffix = String(localPID.suffix(4))
        let devicePrefix = String(UIDevice.current.name.prefix(6))
        let localName = "Berty-\(devicePrefix)-\(pidSuffix)"

        let advertisementData: [String: Any] = [
            CBAdvertisementDataServiceUUIDsKey: [BertyBLEConstants.serviceUUID],
            CBAdvertisementDataLocalNameKey: localName
        ]

        peripheralManager?.startAdvertising(advertisementData)
        isAdvertising = true
        logger.info("Started advertising as: \(localName)")
    }

    /// Send chunked notifications to a subscribed central (server mode)
    /// Uses proper queue management instead of blocking sleep
    private func sendChunkedNotification(data: Data, to central: CBCentral, via characteristic: CBMutableCharacteristic) {
        // Use the central's actual MTU for optimal throughput
        let mtu = central.maximumUpdateValueLength - BertyBLEConstants.attHeaderSize
        let effectiveMtu = max(mtu, 20) // Minimum 20 bytes per BLE spec

        var offset = 0

        while offset < data.count {
            let endIndex = min(offset + effectiveMtu, data.count)
            let chunk = data.subdata(in: offset..<endIndex)

            let success = peripheralManager?.updateValue(
                chunk,
                for: characteristic,
                onSubscribedCentrals: [central]
            ) ?? false

            if !success {
                // Queue is full - store remaining data and wait for peripheralManagerIsReady
                let remainingData = data.subdata(in: offset..<data.count)
                // Prevent unbounded queue growth - drop oldest if at limit
                if pendingNotifications.count >= maxPendingNotifications {
                    logger.info("Notification queue at limit, dropping oldest entry")
                    pendingNotifications.removeFirst()
                }
                pendingNotifications.append((data: remainingData, central: central))
                logger.info("Notification queue full, queued \(remainingData.count) bytes for later")
                return
            }

            offset = endIndex
        }
    }

    /// Process pending notifications when the queue becomes ready
    private func processPendingNotifications() {
        guard !pendingNotifications.isEmpty,
              let writerChar = writerCharacteristic else { return }

        isProcessingNotifications = true

        while !pendingNotifications.isEmpty {
            let pending = pendingNotifications.removeFirst()
            let central = pending.central
            let data = pending.data

            // Use the central's actual MTU
            let mtu = central.maximumUpdateValueLength - BertyBLEConstants.attHeaderSize
            let effectiveMtu = max(mtu, 20)
            var offset = 0

            while offset < data.count {
                let endIndex = min(offset + effectiveMtu, data.count)
                let chunk = data.subdata(in: offset..<endIndex)

                let success = peripheralManager?.updateValue(
                    chunk,
                    for: writerChar,
                    onSubscribedCentrals: [central]
                ) ?? false

                if !success {
                    // Still full - put back remaining data and exit
                    let remainingData = data.subdata(in: offset..<data.count)
                    pendingNotifications.insert((data: remainingData, central: central), at: 0)
                    isProcessingNotifications = false
                    return
                }

                offset = endIndex
            }
        }

        isProcessingNotifications = false
    }

    /// Send chunked writes to a peripheral (client mode)
    /// CoreBluetooth internally queues .withResponse writes and processes them in order
    private func sendChunkedWrite(data: Data, to peripheral: CBPeripheral, via characteristic: CBCharacteristic) {
        // Get negotiated MTU minus ATT header
        let mtu = peripheral.maximumWriteValueLength(for: .withResponse)
        let effectiveMtu = max(mtu, 20) // Minimum 20 bytes per BLE spec
        var offset = 0

        while offset < data.count {
            let endIndex = min(offset + effectiveMtu, data.count)
            let chunk = data.subdata(in: offset..<endIndex)

            // CoreBluetooth queues .withResponse writes internally and processes in order
            // Errors are reported via didWriteValueFor delegate callback
            peripheral.writeValue(chunk, for: characteristic, type: .withResponse)
            offset = endIndex
        }
    }

    // MARK: - Central (Scanning) Implementation

    private func startCentralScanning() {
        let services = [BertyBLEConstants.serviceUUID]
        let options: [String: Any] = [
            CBCentralManagerScanOptionAllowDuplicatesKey: false
        ]

        centralManager?.scanForPeripherals(withServices: services, options: options)
        isScanning = true

        scheduleScanCycle()
        logger.info("Started scanning")
    }

    private func scheduleScanCycle() {
        scanCycleWork?.cancel()

        let cycleWork = DispatchWorkItem { [weak self] in
            guard let self = self, self.isScanning else { return }

            // Pause scanning
            self.centralManager?.stopScan()
            self.logger.info("Scan cycle: paused")

            // Resume after brief pause to process results
            self.bleQueue.asyncAfter(deadline: .now() + 1.0) { [weak self] in
                guard let self = self, self.isScanning else { return }
                self.centralManager?.scanForPeripherals(
                    withServices: [BertyBLEConstants.serviceUUID],
                    options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
                )
                self.logger.info("Scan cycle: resumed")
                self.scheduleScanCycle()
            }
        }

        scanCycleWork = cycleWork
        bleQueue.asyncAfter(deadline: .now() + scanCycleInterval, execute: cycleWork)
    }

    private func connectToPeripheral(_ peripheral: CBPeripheral, peerId: String) {
        let timeoutWork = DispatchWorkItem { [weak self] in
            self?.handleConnectionTimeout(peerId: peerId)
        }
        connectionTimeoutWork[peerId] = timeoutWork
        bleQueue.asyncAfter(deadline: .now() + BertyBLEConstants.connectionTimeout, execute: timeoutWork)

        peripheral.delegate = self
        centralManager?.connect(peripheral, options: nil)

        logger.info("Connecting to peer: \(peerId)")
    }

    private func handleConnectionTimeout(peerId: String) {
        logger.info("Connection timeout for peer: \(peerId)")

        if let peripheral = connectedPeers[peerId] {
            centralManager?.cancelPeripheralConnection(peripheral)
        }

        connectionTimeoutWork.removeValue(forKey: peerId)

        let error = BertyError.bluetoothError(
            .peerConnectionTimeout,
            message: "Connection timeout for peer: \(peerId)"
        )

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didFailWithError: error)
        }
    }

    // MARK: - Peer Management

    private func addDiscoveredPeer(_ peripheral: CBPeripheral, rssi: NSNumber) {
        let peerId = peripheral.identifier.uuidString

        let peer = BertyBLEPeer(
            id: peerId,
            name: peripheral.name,
            rssi: rssi.intValue,
            lastSeen: Date(),
            isConnected: false,
            peripheral: peripheral,
            services: peripheral.services?.map { $0.uuid.uuidString } ?? []
        )

        discoveredPeers[peerId] = peer

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didDiscoverPeer: peer)
        }
    }

    private func removePeer(_ peerId: String) {
        discoveredPeers.removeValue(forKey: peerId)
        connectedPeers.removeValue(forKey: peerId)
        peerCharacteristics.removeValue(forKey: peerId)

        connectionTimeoutWork[peerId]?.cancel()
        connectionTimeoutWork.removeValue(forKey: peerId)
        handshakeTimeoutWork[peerId]?.cancel()
        handshakeTimeoutWork.removeValue(forKey: peerId)

        // Clean up client-side state
        peerWriterCharacteristics.removeValue(forKey: peerId)
        clientHandshakeComplete.removeValue(forKey: peerId)
        clientRemotePIDs.removeValue(forKey: peerId)
        pendingDataCache.removeValue(forKey: peerId)
        clientHandshakeStates.removeValue(forKey: peerId)
    }

    /// Clean up server-side state for a central that disconnected
    private func removeServerPeer(_ centralId: String) {
        subscribedCentrals.removeValue(forKey: centralId)
        incomingPIDBuffers.removeValue(forKey: centralId)
        serverHandshakeComplete.removeValue(forKey: centralId)
        serverRemotePIDs.removeValue(forKey: centralId)
        pendingDataCache.removeValue(forKey: centralId)

        pendingNotifications.removeAll { $0.central.identifier.uuidString == centralId }
    }

    private func disconnectAllPeers() {
        for (_, peripheral) in connectedPeers {
            centralManager?.cancelPeripheralConnection(peripheral)
        }

        // Clean up client-side state
        connectedPeers.removeAll()
        peerCharacteristics.removeAll()
        peerWriterCharacteristics.removeAll()
        clientHandshakeComplete.removeAll()
        clientRemotePIDs.removeAll()
        clientHandshakeStates.removeAll()

        // Clean up server-side state
        subscribedCentrals.removeAll()
        incomingPIDBuffers.removeAll()
        serverHandshakeComplete.removeAll()
        serverRemotePIDs.removeAll()
        pendingNotifications.removeAll()
        isProcessingNotifications = false

        // Clean up shared state
        pendingDataCache.removeAll()

        for work in connectionTimeoutWork.values {
            work.cancel()
        }
        connectionTimeoutWork.removeAll()

        for work in handshakeTimeoutWork.values {
            work.cancel()
        }
        handshakeTimeoutWork.removeAll()
    }

    // MARK: - Data Processing

    private func processReceivedData(_ data: Data, fromPeer peerId: String) {
        // Process and validate received data
        logger.info(" Received \(data.count) bytes from peer: \(peerId)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didReceiveData: data, fromPeer: peerId)
        }
    }

    // MARK: - Debug Information

    func getDebugInfo() -> [String: Any] {
        var info: [String: Any] = [:]

        info["bluetoothState"] = String(describing: bluetoothState)
        info["isAdvertising"] = isAdvertising
        info["isScanning"] = isScanning
        info["discoveredPeersCount"] = discoveredPeers.count
        info["connectedPeersCount"] = connectedPeers.count

        let peersInfo = discoveredPeers.values.map { peer in
            [
                "id": peer.id,
                "name": peer.name ?? "Unknown",
                "rssi": peer.rssi,
                "isConnected": peer.isConnected,
                "lastSeen": peer.lastSeen.timeIntervalSince1970
            ]
        }
        info["peers"] = peersInfo

        return info
    }
}

// MARK: - CBCentralManagerDelegate
extension BertyBLEDriver: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        bluetoothState = central.state
        logger.info("Central manager state updated: \(central.state.rawValue)")

        if central.state != .unknown && central.state != .resetting {
            bluetoothStateCondition.lock()
            bluetoothStateReady = true
            bluetoothStateCondition.broadcast()
            bluetoothStateCondition.unlock()
            logger.info("Bluetooth state ready: \(central.state.rawValue)")
        }

        switch central.state {
        case .poweredOn:
            logger.info("Bluetooth is powered on")
        case .poweredOff:
            logger.info("Bluetooth is powered off")
            stopScanning()
        case .unauthorized:
            let error = BertyError.bluetoothError(
                .bluetoothPermissionDenied,
                message: "Bluetooth permission denied"
            )
                DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didFailWithError: error)
            }
        case .unsupported:
            let error = BertyError.bluetoothError(
                .bluetoothUnavailable,
                message: "Bluetooth is not supported on this device"
            )
                DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didFailWithError: error)
            }
        default:
            break
        }
    }

    func centralManager(_ central: CBCentralManager, willRestoreState dict: [String : Any]) {
        logger.info("Restoring central manager state")

        if let peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] {
            for peripheral in peripherals {
                let peerId = peripheral.identifier.uuidString
                connectedPeers[peerId] = peripheral

                if peripheral.state == .connected {
                    peripheral.delegate = self
                    peripheral.discoverServices([BertyBLEConstants.serviceUUID])
                }
            }
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String: Any], rssi RSSI: NSNumber) {
        let peerId = peripheral.identifier.uuidString
        logger.info("Discovered peripheral: \(peerId)")

        // Also check service data for Android format (PID suffix in service data bytes)
        var remotePIDSuffix: String?

        // Try iOS format first: local name "Berty-<device>-<pid_suffix>"
        if let localName = advertisementData[CBAdvertisementDataLocalNameKey] as? String {
            let components = localName.split(separator: "-")
            if components.count >= 3 {
                remotePIDSuffix = String(components.last ?? "")
            }
        }

        // If no PID from local name, try Android format: PID in service data
        if remotePIDSuffix == nil {
            if let serviceData = advertisementData[CBAdvertisementDataServiceDataKey] as? [CBUUID: Data],
               let pidData = serviceData[BertyBLEConstants.serviceUUID],
               let pidString = String(data: pidData, encoding: .utf8), !pidString.isEmpty {
                remotePIDSuffix = pidString
            }
        }

        if let remoteSuffix = remotePIDSuffix, !localPID.isEmpty {
            let localSuffix = String(localPID.suffix(4))
            if localSuffix >= remoteSuffix {
                // Still add to discovered peers but don't auto-connect
                addDiscoveredPeer(peripheral, rssi: RSSI)
                return
            }
        }

        addDiscoveredPeer(peripheral, rssi: RSSI)

        // Auto-connect if we're the initiator (lower PID suffix)
        // But first check if we already have a connection (client or server) with this peer
        if let remoteSuffix = remotePIDSuffix {
            // Check if we already have a server-side connection with this peer
            let hasServerConnection = serverRemotePIDs.values.contains { pid in
                pid.hasSuffix(remoteSuffix)
            }
            if hasServerConnection { return }

            // Check if we already have a client-side connection
            let hasClientConnection = clientRemotePIDs.values.contains { pid in
                pid.hasSuffix(remoteSuffix)
            }
            if hasClientConnection { return }

            // No existing connection, proceed with auto-connect
            if discoveredPeers[peerId] != nil && connectedPeers[peerId] == nil {
                connectToPeripheral(peripheral, peerId: peerId)
            }
        }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        let peerId = peripheral.identifier.uuidString

        connectionTimeoutWork[peerId]?.cancel()
        connectionTimeoutWork.removeValue(forKey: peerId)

        connectedPeers[peerId] = peripheral

        // Update peer connection status
        if let peer = discoveredPeers[peerId] {
            discoveredPeers[peerId] = BertyBLEPeer(
                id: peer.id,
                name: peer.name,
                rssi: peer.rssi,
                lastSeen: Date(),
                isConnected: true,
                peripheral: peer.peripheral,
                services: peer.services
            )
        }

        // Discover services
        peripheral.discoverServices([BertyBLEConstants.serviceUUID])

        logger.info("Connected to peer: \(peerId)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didConnectToPeer: peerId)
        }
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        let peerId = peripheral.identifier.uuidString

        connectionTimeoutWork[peerId]?.cancel()
        connectionTimeoutWork.removeValue(forKey: peerId)

        removePeer(peerId)

        logger.info("Failed to connect to peer: \(peerId), error: \(error?.localizedDescription ?? "unknown")")

        let bertyError = BertyError.bluetoothError(
            .bleConnectionFailed,
            message: "Failed to connect to peer: \(peerId)",
            underlyingError: error
        )

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didFailWithError: bertyError)
        }
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        let peerId = peripheral.identifier.uuidString

        removePeer(peerId)

        logger.info("Disconnected from peer: \(peerId)")

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didDisconnectFromPeer: peerId, error: error)
        }
    }
}

// MARK: - CBPeripheralDelegate
extension BertyBLEDriver: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error = error {
            logger.info("Error discovering services: \(error.localizedDescription)")
            return
        }

        guard let services = peripheral.services else { return }

        for service in services {
            if service.uuid == BertyBLEConstants.serviceUUID {
                // Discover BOTH PID and WRITER characteristics
                peripheral.discoverCharacteristics(
                    [BertyBLEConstants.pidCharacteristicUUID, BertyBLEConstants.writerCharacteristicUUID],
                    for: service
                )
            }
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error = error {
            logger.info("Error discovering characteristics: \(error.localizedDescription)")
            return
        }

        guard let characteristics = service.characteristics else { return }

        let peerId = peripheral.identifier.uuidString
        var foundPID = false
        var foundWriter = false

        for characteristic in characteristics {
            if characteristic.uuid == BertyBLEConstants.pidCharacteristicUUID {
                peerCharacteristics[peerId] = characteristic
                foundPID = true
                logger.info("Found PID characteristic for peer: \(peerId)")
            } else if characteristic.uuid == BertyBLEConstants.writerCharacteristicUUID {
                peerWriterCharacteristics[peerId] = characteristic
                foundWriter = true
                logger.info("Found WRITER characteristic for peer: \(peerId)")

                // Subscribe to notifications on WRITER characteristic
                if characteristic.properties.contains(.notify) {
                    peripheral.setNotifyValue(true, for: characteristic)
                }
            }
        }

        // If we found both characteristics, initiate handshake
        if foundPID && foundWriter {
            initiateClientHandshake(with: peripheral)
        } else if foundPID {
            // Fallback for older implementations without WRITER
            logger.info("Only PID characteristic found - legacy mode for peer: \(peerId)")
            initiateClientHandshake(with: peripheral)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error = error {
            logger.info("Error updating characteristic value: \(error.localizedDescription)")
            return
        }

        guard let data = characteristic.value else { return }
        let peerId = peripheral.identifier.uuidString

        if characteristic.uuid == BertyBLEConstants.pidCharacteristicUUID {
            // This is the response to our PID read - contains [PSM (4 bytes)][PID]
            handlePIDReadResponse(data: data, fromPeer: peerId, peripheral: peripheral)
        } else if characteristic.uuid == BertyBLEConstants.writerCharacteristicUUID {
            // Data received via WRITER notifications
            handleClientDataReceived(data: data, fromPeer: peerId)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didWriteValueFor characteristic: CBCharacteristic, error: Error?) {
        let peerId = peripheral.identifier.uuidString

        if let error = error {
            logger.info("Error writing to characteristic: \(error.localizedDescription)")

            let bertyError = BertyError.bluetoothError(
                .bleConnectionFailed,
                message: "Write failed for peer: \(peerId)",
                underlyingError: error
            )

            // Cancel handshake and disconnect on write failure
            handshakeTimeoutWork[peerId]?.cancel()
            handshakeTimeoutWork.removeValue(forKey: peerId)
            centralManager?.cancelPeripheralConnection(peripheral)

            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didFailWithError: bertyError)
            }
            return
        }

        if characteristic.uuid == BertyBLEConstants.pidCharacteristicUUID {
            // PID write completed - check if we need to send EOD or read response
            handlePIDWriteComplete(forPeer: peerId, peripheral: peripheral)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateNotificationStateFor characteristic: CBCharacteristic, error: Error?) {
        let peerId = peripheral.identifier.uuidString

        if let error = error {
            logger.info("Error updating notification state: \(error.localizedDescription)")
            return
        }

        if characteristic.uuid == BertyBLEConstants.writerCharacteristicUUID && characteristic.isNotifying {
            logger.info("Subscribed to WRITER notifications for peer: \(peerId)")
            // Finalize handshake if PID exchange is complete
            if clientRemotePIDs[peerId] != nil {
                finalizeClientHandshake(forPeer: peerId)
            }
        }
    }

    // MARK: - Client-Side Handshake Implementation

    private func initiateClientHandshake(with peripheral: CBPeripheral) {
        let peerId = peripheral.identifier.uuidString

        guard let pidChar = peerCharacteristics[peerId] else {
            logger.info("Cannot initiate handshake - PID characteristic not found")
            return
        }

        // Step 1: Write local PID to server's PID characteristic
        guard let pidData = localPID.data(using: .utf8) else {
            logger.info("Cannot initiate handshake - local PID not set")
            return
        }

        let timeoutWork = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            if self.clientHandshakeComplete[peerId] != true {
                self.logger.info("Handshake timeout for peer: \(peerId)")
                self.centralManager?.cancelPeripheralConnection(peripheral)
                self.removePeer(peerId)
            }
        }
        handshakeTimeoutWork[peerId] = timeoutWork
        bleQueue.asyncAfter(deadline: .now() + handshakeTimeout, execute: timeoutWork)

        clientHandshakeStates[peerId] = .writingPID
        logger.info("Client handshake step 1: Writing local PID to peer: \(peerId)")

        // Write PID (may be chunked by CoreBluetooth automatically)
        peripheral.writeValue(pidData, for: pidChar, type: .withResponse)
    }

    private func handlePIDWriteComplete(forPeer peerId: String, peripheral: CBPeripheral) {
        guard let pidChar = peerCharacteristics[peerId] else { return }

        let state = clientHandshakeStates[peerId] ?? .idle

        switch state {
        case .writingPID:
            // Step 2: Send EOD marker
            clientHandshakeStates[peerId] = .writingEOD
            logger.info("Client handshake step 2: Sending EOD marker to peer: \(peerId)")
            peripheral.writeValue(BertyBLEConstants.eodMarkerData, for: pidChar, type: .withResponse)

        case .writingEOD:
            // Step 3: Read server's PID response
            clientHandshakeStates[peerId] = .readingPID
            logger.info("Client handshake step 3: Reading server PID from peer: \(peerId)")
            peripheral.readValue(for: pidChar)

        default:
            break
        }
    }

    private func handlePIDReadResponse(data: Data, fromPeer peerId: String, peripheral: CBPeripheral) {
        // Parse response: [4 bytes PSM (big-endian)][PID string]
        guard data.count > 4 else {
            logger.info("Invalid PID response - too short: \(data.count) bytes")
            return
        }

        // Extract PSM (first 4 bytes, big-endian)
        let psmData = data.subdata(in: 0..<4)
        let psm = psmData.withUnsafeBytes { $0.load(as: Int32.self).bigEndian }

        // Extract remote PID (remaining bytes)
        let pidData = data.subdata(in: 4..<data.count)
        guard let remotePID = String(data: pidData, encoding: .utf8) else {
            logger.info("Invalid PID response - cannot decode PID string")
            return
        }

        logger.info("Client received server response: PSM=\(psm), PID=\(remotePID)")

        // Store remote PID
        clientRemotePIDs[peerId] = remotePID

        // PSM is ignored (iOS doesn't use L2CAP)

        // Step 4: Subscribe to WRITER notifications (already done in didDiscoverCharacteristics)
        // Check if already subscribed
        if let writerChar = peerWriterCharacteristics[peerId], writerChar.isNotifying {
            finalizeClientHandshake(forPeer: peerId)
        } else {
            clientHandshakeStates[peerId] = .subscribing
        }
    }

    private func handleClientDataReceived(data: Data, fromPeer peerId: String) {
        // Check if handshake is complete
        if clientHandshakeComplete[peerId] == true {
            // Forward data to delegate using remote PID
            guard let remotePID = clientRemotePIDs[peerId] else { return }
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didReceiveData: data, fromPeer: remotePID)
            }
        } else {
            // Cache data until handshake completes with size limit
            if pendingDataCache[peerId] == nil {
                pendingDataCache[peerId] = []
            }
            let currentSize = pendingDataCache[peerId]?.reduce(0) { $0 + $1.count } ?? 0
            if currentSize + data.count > maxPendingDataCacheSize {
                logger.info("Pending data cache overflow for peer \(peerId), dropping")
                return
            }
            pendingDataCache[peerId]?.append(data)
            logger.info("Cached client data from peer \(peerId) - handshake pending")
        }
    }

    private func finalizeClientHandshake(forPeer peerId: String) {
        handshakeTimeoutWork[peerId]?.cancel()
        handshakeTimeoutWork.removeValue(forKey: peerId)

        clientHandshakeComplete[peerId] = true
        clientHandshakeStates[peerId] = .complete
        logger.info("Client handshake complete for peer: \(peerId)")

        // Flush cached data
        guard let remotePID = clientRemotePIDs[peerId] else { return }

        if let cachedData = pendingDataCache[peerId] {
            for data in cachedData {
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.delegate?.bleDriver(self, didReceiveData: data, fromPeer: remotePID)
                }
            }
            pendingDataCache.removeValue(forKey: peerId)
        }

        // Notify delegate that handshake-based connection is established
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let peripheral = self.connectedPeers[peerId]
            let serviceUUIDs = peripheral?.services?.map { $0.uuid.uuidString } ?? [BertyBLEConstants.serviceUUID.uuidString]

            // Create a peer object with the remote PID
            let peer = BertyBLEPeer(
                id: remotePID,
                name: peripheral?.name,
                rssi: 0,
                lastSeen: Date(),
                isConnected: true,
                peripheral: peripheral,
                services: serviceUUIDs
            )
            self.delegate?.bleDriver(self, didDiscoverPeer: peer)
        }
    }
}

// MARK: - CBPeripheralManagerDelegate
extension BertyBLEDriver: CBPeripheralManagerDelegate {
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        logger.info("Peripheral manager state updated: \(peripheral.state.rawValue)")

        switch peripheral.state {
        case .poweredOn:
            // Signal that peripheral manager is ready
            peripheralStateCondition.lock()
            peripheralStateReady = true
            peripheralStateCondition.broadcast()
            peripheralStateCondition.unlock()
        case .poweredOff:
            peripheralStateCondition.lock()
            peripheralStateReady = false
            peripheralStateCondition.unlock()
            stopAdvertising()
        default:
            break
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, willRestoreState dict: [String : Any]) {
        logger.info("Restoring peripheral manager state")
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didAdd service: CBService, error: Error?) {
        if let error = error {
            logger.info("Error adding service: \(error.localizedDescription)")
            return
        }

        serviceAdded = true
        logger.info("Successfully added service with characteristics")
        startPeripheralAdvertising()
    }

    func peripheralManagerDidStartAdvertising(_ peripheral: CBPeripheralManager, error: Error?) {
        if let error = error {
            logger.info("Error starting advertising: \(error.localizedDescription)")
            isAdvertising = false
        } else {
            logger.info("Successfully started advertising")
            isAdvertising = true
        }
    }

    func peripheralManagerIsReady(toUpdateSubscribers peripheral: CBPeripheralManager) {
        // Called when the notification queue has space - resume pending notifications
        if !pendingNotifications.isEmpty && !isProcessingNotifications {
            processPendingNotifications()
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveRead request: CBATTRequest) {
        // Handle read requests on PID characteristic
        // Android expects: [4 bytes PSM (big-endian)][PID string bytes]
        guard request.characteristic.uuid == BertyBLEConstants.pidCharacteristicUUID else {
            peripheral.respond(to: request, withResult: .requestNotSupported)
            return
        }

        var responseData = Data()

        // PSM = 0 (iOS doesn't use L2CAP)
        let psm: Int32 = 0
        withUnsafeBytes(of: psm.bigEndian) { responseData.append(contentsOf: $0) }

        // Append local PID
        if let pidData = localPID.data(using: .utf8) {
            responseData.append(pidData)
        }

        // Handle offset for long reads
        if request.offset < responseData.count {
            request.value = responseData.subdata(in: request.offset..<responseData.count)
            peripheral.respond(to: request, withResult: .success)
        } else {
            peripheral.respond(to: request, withResult: .invalidOffset)
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager, didReceiveWrite requests: [CBATTRequest]) {
        guard let firstRequest = requests.first else { return }

        for request in requests {
            guard let data = request.value else { continue }
            let centralId = request.central.identifier.uuidString

            if request.characteristic.uuid == BertyBLEConstants.pidCharacteristicUUID {
                handlePIDWrite(data: data, fromCentral: centralId)
            } else if request.characteristic.uuid == BertyBLEConstants.writerCharacteristicUUID {
                handleWriterData(data: data, fromCentral: centralId)
            }
        }

        peripheral.respond(to: firstRequest, withResult: .success)
    }

    func peripheralManager(_ peripheral: CBPeripheralManager,
                          central: CBCentral,
                          didSubscribeTo characteristic: CBCharacteristic) {
        let centralId = central.identifier.uuidString

        if characteristic.uuid == BertyBLEConstants.writerCharacteristicUUID {
            subscribedCentrals[centralId] = central

            // If handshake was pending, mark as complete now
            if serverRemotePIDs[centralId] != nil {
                finalizeServerHandshake(forCentral: centralId)
            }
        }
    }

    func peripheralManager(_ peripheral: CBPeripheralManager,
                          central: CBCentral,
                          didUnsubscribeFrom characteristic: CBCharacteristic) {
        let centralId = central.identifier.uuidString

        // Notify delegate of disconnection if handshake was complete
        if let remotePID = serverRemotePIDs[centralId] {
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didDisconnectFromPeer: remotePID, error: nil)
            }
        }

        // Clean up server-side state
        removeServerPeer(centralId)
        logger.info("Central \(centralId) unsubscribed from WRITER notifications")
    }

    // MARK: - Server-Side Handshake Helpers

    private func handlePIDWrite(data: Data, fromCentral centralId: String) {
        // Check if this is the EOD marker
        if data == BertyBLEConstants.eodMarkerData {
            // EOD received - process accumulated PID
            if let pidData = incomingPIDBuffers[centralId],
               let remotePID = String(data: pidData, encoding: .utf8) {
                serverRemotePIDs[centralId] = remotePID

                // If already subscribed, finalize handshake
                if subscribedCentrals[centralId] != nil {
                    finalizeServerHandshake(forCentral: centralId)
                }
            }
            incomingPIDBuffers.removeValue(forKey: centralId)
        } else {
            // Accumulate PID data
            if incomingPIDBuffers[centralId] == nil {
                incomingPIDBuffers[centralId] = Data()
            }

            let currentSize = incomingPIDBuffers[centralId]?.count ?? 0
            if currentSize + data.count > maxPIDBufferSize {
                logger.info("PID buffer overflow from central: \(centralId), rejecting")
                incomingPIDBuffers.removeValue(forKey: centralId)
                return
            }

            incomingPIDBuffers[centralId]?.append(data)
        }
    }

    private func handleWriterData(data: Data, fromCentral centralId: String) {
        // Check if handshake is complete
        if serverHandshakeComplete[centralId] == true {
            // Forward data to delegate
            guard let remotePID = serverRemotePIDs[centralId] else { return }
            DispatchQueue.main.async { [weak self] in
                guard let self = self else { return }
                self.delegate?.bleDriver(self, didReceiveData: data, fromPeer: remotePID)
            }
        } else {
            // Cache data until handshake completes with size limit
            if pendingDataCache[centralId] == nil {
                pendingDataCache[centralId] = []
            }
            let currentSize = pendingDataCache[centralId]?.reduce(0) { $0 + $1.count } ?? 0
            if currentSize + data.count > maxPendingDataCacheSize {
                logger.info("Pending data cache overflow for central \(centralId), dropping")
                return
            }
            pendingDataCache[centralId]?.append(data)
        }
    }

    private func finalizeServerHandshake(forCentral centralId: String) {
        serverHandshakeComplete[centralId] = true
        logger.info("Server handshake complete for central: \(centralId)")

        // Flush cached data
        guard let remotePID = serverRemotePIDs[centralId] else { return }

        if let cachedData = pendingDataCache[centralId] {
            for data in cachedData {
                DispatchQueue.main.async { [weak self] in
                    guard let self = self else { return }
                    self.delegate?.bleDriver(self, didReceiveData: data, fromPeer: remotePID)
                }
            }
            pendingDataCache.removeValue(forKey: centralId)
        }

        // Notify delegate of peer connection via server
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.delegate?.bleDriver(self, didConnectToPeer: remotePID)
        }
    }
}

// NOTE: BertyProximityDriverBridge (implementing BertybridgeProximityDriverProtocol)
// is defined in BertyDriverBridges.swift to avoid duplicate class definitions.
