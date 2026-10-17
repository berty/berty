//
//  BertyLogger.swift
//  Berty
//
//  Created by u on 23/12/2022.
//

import os
import Bertybridge

public class BertyLogger {
    public enum LogLevel: String, Comparable {
        case DEBUG
        case INFO
        case WARN
        case ERROR

        var levelString: String {
            return self.rawValue
        }

        var levelGo: Int {
            switch self {
            case .DEBUG:
                return BertybridgeLevelDebug
            case .WARN:
                return BertybridgeLevelWarn
            case .ERROR:
                return BertybridgeLevelError
            default:
                return BertybridgeLevelInfo
            }
        }

        var levelNative: OSLogType {
            switch self {
            case .DEBUG:
                return .debug
            case .WARN:
                return .error
            case .ERROR:
                return .fault
            default:
                return .info
            }
        }

        // For comparison - higher value = more severe
        var severity: Int {
            switch self {
            case .DEBUG: return 0
            case .INFO: return 1
            case .WARN: return 2
            case .ERROR: return 3
            }
        }

        public static func < (lhs: LogLevel, rhs: LogLevel) -> Bool {
            return lhs.severity < rhs.severity
        }
    }

    // MARK: - Static Configuration

    /// Debug mode - defaults to false (production-safe)
    private static var debugMode: Bool = false

    /// Minimum log level for production (only warnings and errors)
    private static let productionMinLevel: LogLevel = .WARN

    private static var bridge: BertybridgeBridge? = nil

    var subsystem: String

    // MARK: - Initialization

    /**
     * Initialize debug mode based on build configuration.
     * Call this during app initialization before any Berty code runs.
     */
    public static func initializeDebugMode(_ isDebug: Bool) {
        debugMode = isDebug
        let log = OSLog(subsystem: "BertyLogger", category: "init")
        os_log("BertyLogger initialized: debugMode=%{public}@", log: log, type: .info,
               isDebug ? "true" : "false")
    }

    public static func useBridge(_ bridge: BertybridgeBridge?) {
        BertyLogger.bridge = bridge
    }

    public init(_ subsystem: String = "logger") {
        self.subsystem = subsystem
    }

    // MARK: - Logging

    public func log(_ level: LogLevel, _ message: String) {
        // In production builds, only log warnings and errors to prevent log flooding
        if !BertyLogger.debugMode && level < BertyLogger.productionMinLevel {
            return
        }

        if let bridge = BertyLogger.bridge {
            bridge.log(level.levelGo, subsystem: self.subsystem, message: message)
        } else {
            let log = OSLog(subsystem: self.subsystem, category: self.subsystem)
            os_log("[%{public}s] %{public}s", log: log, type: level.levelNative,
                   level.levelString, message)
        }
    }

    public func debug(_ message: String) {
        self.log(.DEBUG, message)
    }

    public func info(_ message: String) {
        self.log(.INFO, message)
    }

    public func warn(_ message: String) {
        self.log(.WARN, message)
    }

    public func error(_ message: String) {
        self.log(.ERROR, message)
    }
}
