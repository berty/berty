//
//  RootDir.swift
//  Berty
//
//  Created by Antoine Eddi on 09/08/2021.
//

import Foundation

enum RootDirError: Error {
    case groupID
    case path
}
extension RootDirError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .groupID:
            return NSLocalizedString(
                "unable to retrieve APP_GROUP_ID key from Info.plist",
                comment: ""
            )
        case .path:
            return NSLocalizedString(
                "unable to get app group path url",
                comment: ""
            )
        }
    }
}

func RootDirGet() throws -> String {
  guard let appGroupID = Bundle.main.object(forInfoDictionaryKey: "APP_GROUP_ID") as? String else {
    throw RootDirError.groupID
  }
  guard let path = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupID) else {
    throw RootDirError.path
  }

  return path.path
}

@objc(RootDir)
class RootDir: NSObject {
  @objc func get(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      resolve(try RootDirGet())
    } catch {
      reject("root_dir_failure", error.localizedDescription, error)
    }
  }
}
