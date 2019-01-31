//
//  ViewController.swift
//  NotificationExample
//
//  Copyright © 2018 Berty Technologies. All rights reserved.
//

import UIKit
import UserNotifications
import Core
import PushKit

enum NotificationError: Error {
  case invalidArgument
}

class Notification: NSObject, UNUserNotificationCenterDelegate, CoreNativeNotificationDriverProtocol {

  override init () {
    super.init()
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler:
      @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.alert, .badge, .sound])
  }

  func display(_ title: String?, body: String?, icon: String?, sound: String?, url: String?) throws {
    guard let utitle = title, let ubody = body else {
      throw NotificationError.invalidArgument
    }

    let center = UNUserNotificationCenter.current()
    let content = UNMutableNotificationContent()
    content.title = utitle
    content.body = ubody
    content.userInfo = ["url": url!]
    content.categoryIdentifier = "berty.core.notification"
    content.sound = UNNotificationSound.default()

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
    let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)

    center.add(request)
  }

  func register () throws {
    var err: Error?
    let group = DispatchGroup()

    // request to register for remote notifications
    group.enter()
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(
      options: [.alert, .sound, .badge],
      completionHandler: { granted, error in
        guard granted else {
          err = error
          group.leave()
          return
        }
        group.leave()
      }
    )
    group.wait()
    if err != nil {
      throw err!
    }

    DispatchQueue.main.async {
      // register for remote notifications
      let application = UIApplication.shared
      application.registerForRemoteNotifications()

      // register for pushkit voip notifications
      let voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
      voipRegistry.delegate = application.delegate as! AppDelegate
      voipRegistry.desiredPushTypes = Set([PKPushType.voIP])
    }
  }

  func unregister() throws {
    let group = DispatchGroup()
    group.enter()
    DispatchQueue.main.async {
      // unregister for remote notifications
      let application = UIApplication.shared
      application.unregisterForRemoteNotifications()

      Core.notificationDriver()?.receiveAPNSToken(nil)
      group.leave()
    }
    group.wait()
  }

  func refreshToken() throws {
    try self.unregister()
    try self.register()
  }

}

extension AppDelegate: PKPushRegistryDelegate {

  // get token from pushkit
  func pushRegistry(_ registry: PKPushRegistry,
                    didUpdate pushCredentials: PKPushCredentials,
                    forType type: PKPushType) {
    Core.notificationDriver()?.receiveAPNSToken(pushCredentials.token)
  }

  // iOS >= 8 notifies the delegate that a remote push has been received 
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    forType type: PKPushType) {
    do {
      let json = try JSONSerialization.data(withJSONObject: payload.dictionaryPayload, options: [])
      let data = String(decoding: json, as: UTF8.self)
      Core.notificationDriver().receive(data)
    } catch {
      logger.format("failed to deserialize remote notification : %@", level: .error, error.localizedDescription)
    }
  }
  // iOS >= 11 notifies the delegate that a remote push has been received
  func pushRegistry(
    _ registry: PKPushRegistry,
    didReceiveIncomingPushWith payload: PKPushPayload,
    for type: PKPushType, completion: @escaping () -> Void) {
    do {
      let json = try JSONSerialization.data(withJSONObject: payload.dictionaryPayload, options: [])
      let data = String(decoding: json, as: UTF8.self)
      Core.notificationDriver().receive(data)
    } catch {
      logger.format("failed to deserialize remote notification : %@", level: .error, error.localizedDescription)
    }
  }

  // notifies the delegate that a push token has been invalidated
  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenForType type: PKPushType) {
    // nothing to do
  }

  override func application(_ application: UIApplication, didReceive notification: UILocalNotification) {
    if let data = notification.userInfo as? [String: String] {
      if let url = data["url"] {
        if url.count > 0 {
          self.application(application, open: URL.init(string: url)!, options: [
            UIApplicationOpenURLOptionsKey.sourceApplication: Bundle.main.bundleIdentifier!,
            UIApplicationOpenURLOptionsKey.openInPlace: false
          ])
        }
      }
    }
    // RCTPushNotificationManager.didReceive(notification)
  }
}
