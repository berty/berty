//
//  Logger.swift
//  Berty
//
//  Created by Guilhem Fanton on 17/10/2018.
//

import os
import Bertybridge

enum LoggerError: Error {
  case emptyMessage
  case emptyNamespace
  case invalidLevel
}

enum Level: String {
  case debug = "DEBUG"
  case info = "INFO"
  case warn = "WARN"
  case error = "ERROR"
  case panic = "PANIC"
  case dPanic = "DPANIC"
  case fatal = "FATAL"
  case unknow = "UNKNOW"
}

enum Visibility {
  case visible
  case hidden
}

class LoggerDriver: NSObject, BertybridgeNativeLoggerDriverProtocol {
  var subsytem: String
  var category: String
  var scope: Visibility
  var isEnabled: Bool

  init(_ subsytem: String = "logger", _ category: String = "log") {
    self.subsytem = subsytem
    self.category = category
    self.scope = Visibility.visible
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
            // @FIXME(gfanton): on some device: debug log dont show up on the Console.
            // for the moment, use default type for debug
        case Level.debug:
            type = .default
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
        case Visibility.hidden: os_log("[%{private}@] %{private}@", log: logger, type: type, ulevel, out)
        }
    } else {
        NSLog("[%@] [%@]: %@", level.rawValue, self.subsytem + "." + subsytem, out)
    }
  }

  func format(_ format: NSString, level: Level = Level.info, _ args: CVarArg...) {
      self.print(NSString(format: format, args), level: level)
  }

  func print(_ message: NSString, level: Level = Level.info, category: String? = nil) {
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
