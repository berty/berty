//
//  Common.swift
//  Berty
//
//  Created by Antoine Eddi on 01/12/2021.
//

import Foundation

enum CommonError: Error {
  case groupID
}
extension CommonError: LocalizedError {
  public var errorDescription: String? {
    switch self {
    case .groupID:
      return NSLocalizedString(
        "unable to retrieve appGroupID key from Info.plist",
        comment: ""
      )
    }
  }
}

class Common: NSObject {
  static func groupID() throws -> String {
    guard let appGroupID = Bundle.main.object(forInfoDictionaryKey: "appGroupID") as? String else {
      throw CommonError.groupID
    }

    return appGroupID
  }

  static func userDefaults() throws -> UserDefaults {
    return UserDefaults(suiteName: try groupID())!
  }

  @objc static func objcUserDefaults() -> UserDefaults? {
    do {
      return try userDefaults()
    } catch {
      return nil
    }
  }
}
