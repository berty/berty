import Foundation

// MARK: - Berty Error Categories
enum BertyErrorCategory {
    case network
    case bluetooth
    case keystore
    case bridge
    case storage
    case protocolError
    case permission
    case configuration
    case connectivity
    case unknown
}

// MARK: - Berty Error Recovery Strategy
enum BertyRecoveryStrategy {
    case retry
    case reinitialize
    case reconnect
    case resetConfiguration
    case requestPermission
    case none
}

// MARK: - Berty Error Codes
enum BertyErrorCode: String {
    // Network Errors
    case networkUnavailable = "NETWORK_UNAVAILABLE"
    case networkTimeout = "NETWORK_TIMEOUT"
    case networkConnectionFailed = "NETWORK_CONNECTION_FAILED"
    case mdnsDiscoveryFailed = "MDNS_DISCOVERY_FAILED"

    // Bluetooth Errors
    case bluetoothUnavailable = "BLUETOOTH_UNAVAILABLE"
    case bluetoothPermissionDenied = "BLUETOOTH_PERMISSION_DENIED"
    case bluetoothPowerOff = "BLUETOOTH_POWER_OFF"
    case bleAdvertisingFailed = "BLE_ADVERTISING_FAILED"
    case bleScanningFailed = "BLE_SCANNING_FAILED"
    case bleConnectionFailed = "BLE_CONNECTION_FAILED"

    // Keystore Errors
    case keystoreUnavailable = "KEYSTORE_UNAVAILABLE"
    case keystoreAccessDenied = "KEYSTORE_ACCESS_DENIED"
    case keystoreKeyNotFound = "KEYSTORE_KEY_NOT_FOUND"
    case keystoreEncryptionFailed = "KEYSTORE_ENCRYPTION_FAILED"
    case keystoreDecryptionFailed = "KEYSTORE_DECRYPTION_FAILED"

    // Bridge Errors
    case bridgeNotInitialized = "BRIDGE_NOT_INITIALIZED"
    case bridgeAlreadyInitialized = "BRIDGE_ALREADY_INITIALIZED"
    case bridgeInitializationFailed = "BRIDGE_INITIALIZATION_FAILED"
    case bridgeConnectionLost = "BRIDGE_CONNECTION_LOST"
    case bridgeInvalidOperation = "BRIDGE_INVALID_OPERATION"
    case bridgeProtocolError = "BRIDGE_PROTOCOL_ERROR"
    case bridgeMethodInvocationFailed = "BRIDGE_METHOD_INVOCATION_FAILED"
    case bridgeStreamCreationFailed = "BRIDGE_STREAM_CREATION_FAILED"
    case bridgeStreamTimeout = "BRIDGE_STREAM_TIMEOUT"
    case bridgePromiseTimeout = "BRIDGE_PROMISE_TIMEOUT"
    case bridgeDirectoryError = "BRIDGE_DIRECTORY_ERROR"

    // Storage Errors
    case storageAccessDenied = "STORAGE_ACCESS_DENIED"
    case storageInsufficientSpace = "STORAGE_INSUFFICIENT_SPACE"
    case storageCorrupted = "STORAGE_CORRUPTED"
    case storageWriteError = "STORAGE_WRITE_ERROR"
    case storageReadError = "STORAGE_READ_ERROR"

    // Protocol Errors
    case protocolVersionMismatch = "PROTOCOL_VERSION_MISMATCH"
    case protocolInvalidMessage = "PROTOCOL_INVALID_MESSAGE"
    case protocolEncryptionFailed = "PROTOCOL_ENCRYPTION_FAILED"
    case protocolDecryptionFailed = "PROTOCOL_DECRYPTION_FAILED"
    case protocolGroupNotFound = "PROTOCOL_GROUP_NOT_FOUND"
    case protocolMemberNotFound = "PROTOCOL_MEMBER_NOT_FOUND"

    // Permission Errors
    case locationPermissionDenied = "LOCATION_PERMISSION_DENIED"
    case backgroundPermissionDenied = "BACKGROUND_PERMISSION_DENIED"
    case notificationPermissionDenied = "NOTIFICATION_PERMISSION_DENIED"
    case localNetworkPermissionDenied = "LOCAL_NETWORK_PERMISSION_DENIED"

    // Configuration Errors
    case configurationInvalid = "CONFIGURATION_INVALID"
    case configurationMissing = "CONFIGURATION_MISSING"
    case configurationCorrupted = "CONFIGURATION_CORRUPTED"

    // Connectivity Errors
    case peerDiscoveryFailed = "PEER_DISCOVERY_FAILED"
    case peerConnectionTimeout = "PEER_CONNECTION_TIMEOUT"
    case peerAuthenticationFailed = "PEER_AUTHENTICATION_FAILED"

    // Unknown Errors
    case unknown = "UNKNOWN_ERROR"
}

// MARK: - Berty Error
class BertyError: NSError, @unchecked Sendable {
    let bertyCode: BertyErrorCode
    let category: BertyErrorCategory
    let recoveryStrategy: BertyRecoveryStrategy
    let isRecoverable: Bool
    let retryCount: Int
    let maxRetries: Int

    init(
        code: BertyErrorCode,
        message: String,
        category: BertyErrorCategory = .unknown,
        recoveryStrategy: BertyRecoveryStrategy = .none,
        isRecoverable: Bool = false,
        retryCount: Int = 0,
        maxRetries: Int = 3,
        underlyingError: Error? = nil
    ) {
        self.bertyCode = code
        self.category = category
        self.recoveryStrategy = recoveryStrategy
        self.isRecoverable = isRecoverable
        self.retryCount = retryCount
        self.maxRetries = maxRetries

        var userInfo: [String: Any] = [
            NSLocalizedDescriptionKey: message,
            "BertyErrorCode": code.rawValue,
            "BertyCategory": String(describing: category),
            "RecoveryStrategy": String(describing: recoveryStrategy),
            "IsRecoverable": isRecoverable,
            "RetryCount": retryCount,
            "MaxRetries": maxRetries
        ]

        if let underlyingError = underlyingError {
            userInfo[NSUnderlyingErrorKey] = underlyingError
        }

        super.init(domain: "BertyErrorDomain", code: 0, userInfo: userInfo)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Error Factory Methods

    static func networkError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        return BertyError(
            code: code,
            message: message,
            category: .network,
            recoveryStrategy: .reconnect,
            isRecoverable: true,
            underlyingError: underlyingError
        )
    }

    static func bluetoothError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        let recoverable = code != .bluetoothPermissionDenied && code != .bluetoothUnavailable
        let strategy: BertyRecoveryStrategy = code == .bluetoothPermissionDenied ? .requestPermission : .retry

        return BertyError(
            code: code,
            message: message,
            category: .bluetooth,
            recoveryStrategy: strategy,
            isRecoverable: recoverable,
            underlyingError: underlyingError
        )
    }

    static func keystoreError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        let recoverable = code != .keystoreUnavailable && code != .keystoreAccessDenied
        let strategy: BertyRecoveryStrategy = code == .keystoreAccessDenied ? .requestPermission : .retry

        return BertyError(
            code: code,
            message: message,
            category: .keystore,
            recoveryStrategy: strategy,
            isRecoverable: recoverable,
            underlyingError: underlyingError
        )
    }

    static func bridgeError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        let strategy: BertyRecoveryStrategy = code == .bridgeNotInitialized ? .reinitialize : .retry

        return BertyError(
            code: code,
            message: message,
            category: .bridge,
            recoveryStrategy: strategy,
            isRecoverable: true,
            underlyingError: underlyingError
        )
    }

    static func storageError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        let recoverable = code != .storageAccessDenied && code != .storageInsufficientSpace

        return BertyError(
            code: code,
            message: message,
            category: .storage,
            recoveryStrategy: .retry,
            isRecoverable: recoverable,
            underlyingError: underlyingError
        )
    }

    static func protocolError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        let recoverable = code != .protocolVersionMismatch

        return BertyError(
            code: code,
            message: message,
            category: .protocolError,
            recoveryStrategy: .retry,
            isRecoverable: recoverable,
            underlyingError: underlyingError
        )
    }

    static func permissionError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        return BertyError(
            code: code,
            message: message,
            category: .permission,
            recoveryStrategy: .requestPermission,
            isRecoverable: false,
            underlyingError: underlyingError
        )
    }

    static func configurationError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        return BertyError(
            code: code,
            message: message,
            category: .configuration,
            recoveryStrategy: .resetConfiguration,
            isRecoverable: true,
            underlyingError: underlyingError
        )
    }

    static func connectivityError(_ code: BertyErrorCode, message: String, underlyingError: Error? = nil) -> BertyError {
        return BertyError(
            code: code,
            message: message,
            category: .connectivity,
            recoveryStrategy: .reconnect,
            isRecoverable: true,
            underlyingError: underlyingError
        )
    }

    // MARK: - Recovery Methods

    func canRetry() -> Bool {
        return isRecoverable && retryCount < maxRetries
    }

    func withIncrementedRetry() -> BertyError {
        return BertyError(
            code: bertyCode,
            message: localizedDescription,
            category: category,
            recoveryStrategy: recoveryStrategy,
            isRecoverable: isRecoverable,
            retryCount: retryCount + 1,
            maxRetries: maxRetries,
            underlyingError: userInfo[NSUnderlyingErrorKey] as? Error
        )
    }

    // MARK: - User-Friendly Messages

    var userFriendlyMessage: String {
        switch bertyCode {
        case .networkUnavailable:
            return "No internet connection available. Please check your network settings."
        case .bluetoothUnavailable:
            return "Bluetooth is not available on this device."
        case .bluetoothPermissionDenied:
            return "Bluetooth access is required for offline messaging. Please enable Bluetooth permissions in Settings."
        case .bluetoothPowerOff:
            return "Please turn on Bluetooth to enable offline messaging."
        case .locationPermissionDenied:
            return "Location access is required for peer discovery. Please enable location permissions in Settings."
        case .backgroundPermissionDenied:
            return "Background app refresh is required for message notifications. Please enable it in Settings."
        case .storageInsufficientSpace:
            return "Not enough storage space available. Please free up some space and try again."
        case .bridgeInitializationFailed:
            return "Failed to initialize secure messaging. Please restart the app."
        case .protocolVersionMismatch:
            return "App version is incompatible with current protocol. Please update the app."
        default:
            return localizedDescription
        }
    }
}

// MARK: - Error Handler
class BertyErrorHandler {
    static let shared = BertyErrorHandler()

    private let logger = BertyLogger("tech.berty.error")
    private var errorCount: [String: Int] = [:]
    private let maxRetries = 3

    func handle(_ error: BertyError, recovery: BertyErrorRecoverable? = nil) {
        logger.error("Handling error: \(error.localizedDescription)")
        logger.error("Error code: \(error.bertyCode.rawValue)")

        // Track error count
        let errorKey = error.bertyCode.rawValue
        errorCount[errorKey] = (errorCount[errorKey] ?? 0) + 1

        // Check if we should attempt recovery
        if let recovery = recovery,
           recovery.canRecover(from: error),
           (errorCount[errorKey] ?? 0) <= maxRetries {

            logger.info("Attempting recovery for error: \(errorKey)")
            recovery.recover(from: error) { [weak self] success in
                if success {
                    self?.logger.info("Recovery successful for error: \(errorKey)")
                    self?.errorCount[errorKey] = 0
                } else {
                    self?.logger.error("Recovery failed for error: \(errorKey)")
                }
            }
        } else if (errorCount[errorKey] ?? 0) > maxRetries {
            logger.error("Max retries exceeded for error: \(errorKey)")
        }
    }

    func reset() {
        errorCount.removeAll()
    }
}

// MARK: - Error Recovery Protocol
protocol BertyErrorRecoverable {
    func canRecover(from error: BertyError) -> Bool
    func recover(from error: BertyError, completion: @escaping (Bool) -> Void)
}

// MARK: - Error Recovery Manager
class BertyErrorRecoveryManager {
    static let shared = BertyErrorRecoveryManager()
    private var recoveryAttempts: [String: Int] = [:]

    private init() {}

    func shouldAttemptRecovery(for error: BertyError) -> Bool {
        let key = error.bertyCode.rawValue
        let attempts = recoveryAttempts[key] ?? 0
        return error.isRecoverable && attempts < error.maxRetries
    }

    func recordRecoveryAttempt(for error: BertyError) {
        let key = error.bertyCode.rawValue
        recoveryAttempts[key] = (recoveryAttempts[key] ?? 0) + 1
    }

    func resetRecoveryAttempts(for errorCode: BertyErrorCode) {
        recoveryAttempts.removeValue(forKey: errorCode.rawValue)
    }

    func clearAllRecoveryAttempts() {
        recoveryAttempts.removeAll()
    }
}
