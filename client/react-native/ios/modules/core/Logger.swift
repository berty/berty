//
//  Looger.swift
//  Berty
//
//  Created by Guilhem Fanton on 17/10/2018.
//

import os

enum LoggerError: Error {
    case emptyMessage
    case emptyNamespace
    case invalidLevel
}

enum Level: String {
    case Debug = "DEBUG"
    case Info = "INFO"
    case Warn = "WARN"
    case Error = "ERROR"
    case Panic = "PANIC"
    case DPanic = "DPANIC"
    case Fatal = "FATAL"
    case Unknow = "UNKNOW"
}

enum Scope {
    case Public
    case Private
}


class Logger: NSObject, CoreNativeLoggerProtocol {
    var subsytem: String
    var category: String
    var scope: Scope
    var isEnabled: Bool

    init(_ subsytem: String = "logger", _ category: String = "log") {
        self.subsytem = subsytem
        self.category = category
        self.scope = Scope.Public
        self.isEnabled = true
    }

    func log(_ level: String?, namespace: String?, message: String?) throws {
        guard let ulevel = level, let level = Level(rawValue: ulevel) else {
            throw LoggerError.invalidLevel
        }

        guard let out = message else {
            throw LoggerError.emptyMessage
        }

        guard let subsystem = namespace else {
            throw LoggerError.emptyNamespace
        }

        if #available(iOS 10.0, *) {
            let logger = OSLog(subsystem: self.subsytem + "." + subsystem, category: self.category)

            var type: OSLogType
            switch level {
            case Level.Debug:
                type = .debug
            case Level.Info:
                type = .info
            case Level.Warn:
                type = .error
            case Level.Error:
                type = .error
            case Level.DPanic:
                type = .fault
            case Level.Panic:
                type = .fault
            case Level.Fatal:
                type = .fault
            default:
                type = OSLogType.default
            }

            switch self.scope {
            case Scope.Private: os_log("%{private}@", log: logger, type: type, out)
            case Scope.Public: os_log("%{public}@", log: logger, type: type, out)
            }

        } else {
            NSLog("[%@] [%@]: %@", level.rawValue, self.subsytem + "." + subsytem, out)
        }
    }

    func format(_ format: NSString, level: Level = Level.Info, _ args: CVarArg...) {
        let message = NSString(format: format, args) as String
        try! self.log(level.rawValue, namespace: self.category, message: message)
    }
open
    // @TODO: implement this
    func levelEnabler(_ level: String!) -> Bool {
        return self.isEnabled
    }
}
