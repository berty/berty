import Foundation

// MARK: - Berty Configuration

struct BertyConfiguration {

    // MARK: - Bundle Configuration

    private static var infoDictionary: [String: Any] {
        return Bundle.main.infoDictionary ?? [:]
    }

    // MARK: - Keychain Configuration

    static var keychainAccessGroup: String {
        return infoDictionary["appGroupID"] as? String ?? "group.tech.berty"
    }

    static let keychainService = "BertyNativeKeystore"
    static let bertyKeychainService = "tech.berty"

    // MARK: - App Group Configuration

    static var appGroupIdentifier: String {
        return keychainAccessGroup
    }

    // MARK: - Background Task Identifiers

    static let backgroundRefreshTaskIdentifier = "tech.berty.background.refresh"
    static let backgroundProcessingTaskIdentifier = "tech.berty.background.processing"

    // MARK: - BLE Configuration

    // UUIDs normalized to lowercase to match Android implementation
    static let bleServiceUUID = "00004240-0000-1000-8000-00805f9b34fb"
    static let blePIDCharacteristicUUID = "00004241-0000-1000-8000-00805f9b34fb"
    static let bleWriterCharacteristicUUID = "00004242-0000-1000-8000-00805f9b34fb"
    static let bleCCCDescriptorUUID = "00002902-0000-1000-8000-00805f9b34fb"
    static let bleEODMarker = "EOD"
    static let bleMaxDataLength = 512
    static let bleATTHeaderSize = 3

    // Legacy alias for backward compatibility
    static let bleCharacteristicUUID = blePIDCharacteristicUUID
    static let bleConnectionTimeout: TimeInterval = 30.0
    static let bleScanTimeout: TimeInterval = 10.0
    static let bleReconnectDelay: TimeInterval = 2.0
    static let bleScanRestartInterval: TimeInterval = 30.0

    // MARK: - Network Configuration

    static let defaultTimeout: TimeInterval = 30.0
    static let promiseTimeout: TimeInterval = 30.0
    static let streamTimeout: TimeInterval = 60.0
    static let maxRetryAttempts = 3

    // MARK: - Storage Configuration

    static let databaseName = "berty.db"
    static let logFileName = "berty.log"
    static let maxLogFileSize: Int64 = 10 * 1024 * 1024 // 10MB

    // MARK: - Directory Configuration

    static var applicationSupportDirectory: URL? {
        guard let appGroup = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            return FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        }
        return appGroup.appendingPathComponent("Application Support")
    }

    static var documentsDirectory: URL? {
        guard let appGroup = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
        }
        return appGroup.appendingPathComponent("Documents")
    }

    static var cacheDirectory: URL? {
        guard let appGroup = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
            return FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first
        }
        return appGroup.appendingPathComponent("Caches")
    }

    static var bertyDataDirectory: URL? {
        return applicationSupportDirectory?.appendingPathComponent("Berty")
    }

    // MARK: - Logger Configuration

    static let loggerSubsystem = "tech.berty"
    static let defaultLogLevel = "info"

    // MARK: - Bridge Configuration

    static let bridgeRestoreIdentifierCentral = "tech.berty.central"
    static let bridgeRestoreIdentifierPeripheral = "tech.berty.peripheral"

    // MARK: - Development Configuration

    #if DEBUG
    static let isDevelopment = true
    static let enableDebugLogging = true
    static let enableMockData = false
    #else
    static let isDevelopment = false
    static let enableDebugLogging = false
    static let enableMockData = false
    #endif

    // MARK: - Feature Flags

    static let enableBackgroundSync = true
    static let enablePushNotifications = true
    static let enableBLEProximity = true
    static let enableOfflineMode = true

    // MARK: - Version Information

    static var appVersion: String {
        return infoDictionary["CFBundleShortVersionString"] as? String ?? "1.0.0"
    }

    static var buildNumber: String {
        return infoDictionary["CFBundleVersion"] as? String ?? "1"
    }

    static var bundleIdentifier: String {
        return Bundle.main.bundleIdentifier ?? "tech.berty"
    }
}

// MARK: - Configuration Validation

extension BertyConfiguration {

    static func validate() throws {
        // Ensure required directories exist
        if let bertyDir = bertyDataDirectory {
            try FileManager.default.createDirectory(at: bertyDir, withIntermediateDirectories: true, attributes: nil)
        }

        // Validate keychain access
        guard !keychainAccessGroup.isEmpty else {
            throw BertyError.configurationError(.configurationMissing, message: "Keychain access group not configured")
        }

        // Validate app group
        guard FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) != nil else {
            throw BertyError.configurationError(.configurationInvalid, message: "App group not properly configured")
        }
    }
}

// MARK: - UserDefaults Extension

extension UserDefaults {

    static var berty: UserDefaults? {
        return UserDefaults(suiteName: BertyConfiguration.appGroupIdentifier)
    }
}
