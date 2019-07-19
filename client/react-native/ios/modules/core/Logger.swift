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

class Logger: NSObject, CoreNativeLoggerProtocol {
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

    let logger = OSLog(subsystem: self.subsytem + "." + subsystem, category: self.category)

    var type: OSLogType
    switch level {
    case Level.debug:
      type = .debug
    case Level.info:
      type = .info
    case Level.warn, Level.error:
      type = .error
      type = .error
    case Level.dPanic, Level.panic, Level.fatal:
      type = .fault
      type = .fault
    default:
      type = OSLogType.default
    }

    switch self.scope {
    case Visibility.hidden: os_log("%{private}@", log: logger, type: type, out)
    case Visibility.visible: os_log("%{public}@", log: logger, type: type, out)
    }

  }

  func format(_ format: NSString, level: Level = Level.info, _ args: CVarArg...) {
    let message = NSString(format: format, args) as String
    do {
      try self.log(level.rawValue, namespace: self.category, message: message)
    } catch {
      NSLog("[%@] [%@]: %@", level.rawValue, self.subsytem + ".log", message)
    }
  }

  // @TODO: implement this
  open func levelEnabler(_ level: String!) -> Bool {
    return self.isEnabled
  }
}
