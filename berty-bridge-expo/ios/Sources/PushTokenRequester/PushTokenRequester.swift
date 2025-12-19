//
//  PushTokenRequester.swift
//  Berty
//
//  Created by Antoine Eddi on 02/08/2021.
//

import UserNotifications
import ExpoModulesCore

@objc(PushTokenRequester)
class PushTokenRequester: NSObject {
  static var shared: PushTokenRequester = PushTokenRequester()
  static let requestSema = DispatchSemaphore(value: 1)
  static var promise: Promise? = nil;

    func request(_ promise: Promise) {
    PushTokenRequester.requestSema.wait()
    defer { PushTokenRequester.requestSema.signal() }

    PushTokenRequester.promise = promise

    UNUserNotificationCenter.current().getNotificationSettings { settings in
      switch settings.authorizationStatus {
      case .authorized, .provisional:
        DispatchQueue.main.async {
          UIApplication.shared.registerForRemoteNotifications()
        }

      default:
        let error = NSError(domain: "push", code: 1, userInfo: [NSLocalizedDescriptionKey: "notification permission not granted"])
          promise.reject(error)
        PushTokenRequester.promise = nil
      }
    }
  }

  @objc func onRequestSucceeded(_ deviceToken: Data) {
      if PushTokenRequester.promise != nil {
      if let bundleID = Bundle.main.bundleIdentifier {
        if let jsonData = try? JSONSerialization.data(withJSONObject: [
          "token": deviceToken.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)),
          "bundleId": bundleID,
        ], options: []) {
            PushTokenRequester.promise!.resolve(String(data: jsonData, encoding: .ascii))
          PushTokenRequester.promise = nil
          return
        }

        let error = NSError(domain: "push", code: 1, userInfo: [NSLocalizedDescriptionKey: "can't serialize token request response"])
          if PushTokenRequester.promise != nil {
              PushTokenRequester.promise!.reject(error)
          PushTokenRequester.promise = nil
        } else {
          NSLog("PushTokenRequester error (onRequestSucceeded): %@", error.localizedDescription)
        }
      } else {
        NSLog("PushTokenRequester error (onRequestSucceeded): resolve is nil")
      }
    }
  }

  @objc func onRequestFailed(_ requestError: Error) {
    if PushTokenRequester.promise != nil {
        PushTokenRequester.promise!.reject(requestError)
      PushTokenRequester.promise = nil
    } else {
      NSLog("PushTokenRequester error (onRequestFailed): reject is nil")
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
