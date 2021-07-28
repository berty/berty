//
//  PushNotificationDriver.swift
//  Berty
//
//  Created by Antoine Eddi on 02/08/2021.
//

import Bertybridge
import UserNotifications

public class PushNotificationDriver: NSObject, BertybridgePushNotificationDriverProtocol {
  public static var shared: PushNotificationDriver = PushNotificationDriver()
  let logger: LoggerDriver = LoggerDriver("tech.berty", "push")
  var requestTokenCallback: BertybridgeRequestTokenCallbackProtocol?

  @objc static func getSharedInstance() -> PushNotificationDriver {
      return PushNotificationDriver.shared
  }

  public func requestToken(_ rtc: BertybridgeRequestTokenCallbackProtocol?) {
    self.requestTokenCallback = rtc

    UNUserNotificationCenter.current().getNotificationSettings { settings in
      switch settings.authorizationStatus {
      case .authorized, .provisional:
        DispatchQueue.main.async {
          UIApplication.shared.registerForRemoteNotifications()
        }
      default:
        self.onRequestFailed(NSError(domain: "push", code: 1, userInfo: [NSLocalizedDescriptionKey: "notification permission not granted"]))
        }
    }
  }

  @objc func onRequestSucceeded(_ deviceToken: NSData) {
    guard let callback = self.requestTokenCallback else {
      self.logger.print("error: requestTokenCallback is not set", level: .dPanic)
      return
    }
    callback.onSuccess(deviceToken as Data)
  }

  @objc func onRequestFailed(_ requestError: NSError) {
    guard let callback = self.requestTokenCallback else {
      self.logger.print("error: requestTokenCallback is not set", level: .dPanic)
      return
    }
    callback.onFailure(requestError)
  }
}
