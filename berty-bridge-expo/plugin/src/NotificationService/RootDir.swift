//
//  RootDir.swift
//  Berty
//
//  Created by Antoine Eddi on 09/08/2021.
//

import Foundation

enum RootDirError: Error {
    case path
}
extension RootDirError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .path:
            return NSLocalizedString(
                "unable to get app group path url",
                comment: ""
            )
        }
    }
}

func RootDirGet() throws -> String {
  guard let appGroupPath = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: try Common.groupID()) else {
    throw RootDirError.path
  }
  let rootDirPath = appGroupPath.appendingPathComponent("berty", isDirectory: true)

  return rootDirPath.path
}
