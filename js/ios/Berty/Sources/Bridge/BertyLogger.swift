//
//  BertyLogger.swift
//  Berty
//
//  Created by u on 23/12/2022.
//

import os
import Bertybridge

public class BertyLogger {
    public enum LogLevel: String {
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
    }

    private static var bridge: BertybridgeBridge? = nil;

    public static func useBridge(_ bridge: BertybridgeBridge?) {
        BertyLogger.bridge = bridge
    }

    var subsytem: String
    public init(_ subsytem: String = "logger") {
        self.subsytem = subsytem
    }

    public func log(_ level: LogLevel, _ message: String) {
        if (BertyLogger.bridge == nil) {
            os_log("[%{public}s] [%{public}s] %{public}s", type: level.levelNative,
                level.levelString, self.subsytem, message)
            return
        }
      BertyLogger.bridge!.log(level.levelGo, subsystem: self.subsytem, message: message)
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
