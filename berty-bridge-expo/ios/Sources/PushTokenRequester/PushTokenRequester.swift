//
//  PushTokenRequester.swift
//  Berty
//
//  Created by Antoine Eddi on 02/08/2021.
//

import UserNotifications

@objc(PushTokenRequester)
class PushTokenRequester: NSObject {
  @objc static var shared: PushTokenRequester = PushTokenRequester()
  static let requestSema = DispatchSemaphore(value: 1)
  static var resolve: RCTPromiseResolveBlock? = nil;
  static var reject: RCTPromiseRejectBlock? = nil;

  @objc func request(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    PushTokenRequester.requestSema.wait()
    defer { PushTokenRequester.requestSema.signal() }

    PushTokenRequester.resolve = resolve
    PushTokenRequester.reject = reject

    UNUserNotificationCenter.current().getNotificationSettings { settings in
      switch settings.authorizationStatus {
      case .authorized, .provisional:
        DispatchQueue.main.async {
          UIApplication.shared.registerForRemoteNotifications()
        }

      default:
        let error = NSError(domain: "push", code: 1, userInfo: [NSLocalizedDescriptionKey: "notification permission not granted"])
        reject("token_request_failed", error.localizedDescription, error)
        PushTokenRequester.resolve = nil
        PushTokenRequester.reject = nil
      }
    }
  }

  @objc func onRequestSucceeded(_ deviceToken: NSData) {
    if let resolve = PushTokenRequester.resolve {
      if let bundleID = Bundle.main.bundleIdentifier {
        if let jsonData = try? JSONSerialization.data(withJSONObject: [
          "token": deviceToken.base64EncodedString(options: NSData.Base64EncodingOptions(rawValue: 0)),
          "bundleId": bundleID,
        ], options: []) {
          resolve(String(data: jsonData, encoding: .ascii))
          PushTokenRequester.resolve = nil
          PushTokenRequester.reject = nil
          return
        }

        let error = NSError(domain: "push", code: 1, userInfo: [NSLocalizedDescriptionKey: "can't serialize token request response"])
        if let reject = PushTokenRequester.reject {
          reject("token_request_failed", error.localizedDescription, error)
          PushTokenRequester.resolve = nil
          PushTokenRequester.reject = nil
        } else {
          NSLog("PushTokenRequester error (onRequestSucceeded): %@", error.localizedDescription)
        }
      } else {
        NSLog("PushTokenRequester error (onRequestSucceeded): resolve is nil")
      }
    }
  }

  @objc func onRequestFailed(_ requestError: NSError) {
    if let reject = PushTokenRequester.reject {
      reject("token_request_failed", requestError.localizedDescription, requestError)
      PushTokenRequester.resolve = nil
      PushTokenRequester.reject = nil
    } else {
      NSLog("PushTokenRequester error (onRequestFailed): reject is nil")
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
