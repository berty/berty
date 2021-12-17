//
//  Logger.swift
//  Berty
//
//  Created by Guilhem Fanton on 17/10/2018.
//

import os
import Bertybridge

public enum LoggerError: Error {
  case emptyMessage
  case emptyNamespace
  case invalidLevel
}

public enum Level: String {
  case debug = "DEBUG"
  case info = "INFO"
  case warn = "WARN"
  case error = "ERROR"
  case panic = "PANIC"
  case dPanic = "DPANIC"
  case fatal = "FATAL"
  case unknow = "UNKNOW"
}

public enum Visibility {
  case visible
  case hidden
}

public class LoggerDriver: NSObject, BertybridgeNativeLoggerDriverProtocol {
  var subsytem: String
  var category: String
  var scope: Visibility
  var isEnabled: Bool

  public init(_ subsytem: String = "logger", _ category: String = "log") {
    self.subsytem = subsytem
    self.category = category
    #if CFG_APPSTORE
    self.scope = Visibility.hidden
    #else
    self.scope = Visibility.visible
    #endif

    self.isEnabled = true
  }

  public func log(_ level: String?, namespace: String?, message: String?) throws {
    guard let ulevel = level, let level = Level(rawValue: ulevel) else {
      throw LoggerError.invalidLevel
    }

    let out = message ?? ""
    var subsystem: String
    if let namespace = namespace, namespace != ""  {
      subsystem = self.subsytem + "." + namespace
    } else {
      subsystem = self.subsytem
    }

    if #available(iOS 10.0, *) {
        let logger = OSLog(subsystem: subsystem, category: self.category)

        var type: OSLogType
        switch level {
        case Level.debug:
            type = .debug
        case Level.info:
            type = .info
        case Level.warn:
            type = .error
        case Level.error, Level.dPanic, Level.panic, Level.fatal:
            type = .fault
        default:
            type = .default
        }

        switch self.scope {
        case Visibility.visible: os_log("[%{public}@] %{public}@", log: logger, type: type, ulevel, out)
        case Visibility.hidden: os_log("[%{public}@] %{private}@", log: logger, type: type, ulevel, out)
        }
    } else {
        NSLog("[%@] [%@]: %@", level.rawValue, self.subsytem + "." + subsytem, out)
    }
  }

  public func format(_ format: NSString, level: Level = Level.info, _ args: CVarArg...) {
      self.print(NSString(format: format, args), level: level)
  }

  public func print(_ message: NSString, level: Level = Level.info, category: String? = nil) {
      let namespace = category ?? self.category
      do {
          try self.log(level.rawValue, namespace: namespace, message: message as String)
      } catch {
          NSLog("[%@] [%@]: %@", level.rawValue, self.subsytem + ".log", message)
      }
  }

  // @TODO: implement this
  open func levelEnabler(_ level: String?) -> Bool {
    return self.isEnabled
  }
}
