//
//  ViewController.swift
//  NotificationExample
//
//  Created by Belal Khan on 13/01/18.
//  Copyright © 2018 Belal Khan. All rights reserved.
//

import UIKit
import UserNotifications
import Core

enum NotificationError: Error {
  case invalidArgument
}

class Notification: NSObject, UNUserNotificationCenterDelegate, CoreNativeNotificationDriverProtocol {

  override init () {
    super.init()
  }

  @available(iOS 10.0, *)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler:
      @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.alert, .badge, .sound])
  }

  func displayNotification(_ title: String?, body: String?, icon: String?, sound: String?, url: String?) throws {
    guard let utitle = title, let ubody = body else {
      throw NotificationError.invalidArgument
    }

    if #available(iOS 10.0, *) {

      let center = UNUserNotificationCenter.current()
      let content = UNMutableNotificationContent()
      content.title = utitle
      content.body = ubody
      content.userInfo =  [ "url": url ]
      content.categoryIdentifier = "berty.core.notification"
      content.sound = UNNotificationSound.default()

      let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
      let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)

      center.add(request)

    } else {

      let notification = UILocalNotification()
      notification.fireDate = Date()
      notification.alertTitle = title
      notification.alertBody = body

      notification.soundName = UILocalNotificationDefaultSoundName
      UIApplication.shared.scheduleLocalNotification(notification)

    }
  }

  func register() throws {
    var err: Error?

    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
      UNUserNotificationCenter.current().requestAuthorization(
        options: [.alert, .sound, .badge],
        completionHandler: { granted, error in
          guard granted else {
            do {
              try self.unregister()
            } catch { }
            err = error
            return
          }
        }
      )
    }

    if err != nil {
      throw err!
    }

    let application = UIApplication.shared
    application.registerForRemoteNotifications()
  }

  func unregister() throws {
    let application = UIApplication.shared
    application.unregisterForRemoteNotifications()
    Core.notificationDriver()?.receiveAPNSToken(nil)
  }

  func refreshToken() throws {
    let application = UIApplication.shared
    application.unregisterForRemoteNotifications()
    application.registerForRemoteNotifications()
  }

}

extension AppDelegate {
  override func application(
    _ application: UIApplication,
    didRegister notificationSettings: UIUserNotificationSettings) {
    // RCTPushNotificationManager.didRegister(notificationSettings)
  }

  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    // RCTPushNotificationManager.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
    Core.notificationDriver()?.receiveAPNSToken(deviceToken)
  }

  override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
    // RCTPushNotificationManager.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)

    do {
      let json = try JSONSerialization.data(withJSONObject: userInfo, options: [])
      let data = String(decoding: json, as: UTF8.self)
      Core.notificationDriver()?.receive(data)
    } catch {
      logger.format("failed to deserialize remote notification : %@", level: .error, error.localizedDescription)
    }
  }

  override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error) {
    logger.format("failed to register for remote notification : %@", level: .error, error.localizedDescription)
    Core.notificationDriver()?.receiveAPNSToken(nil)
    // RCTPushNotificationManager.didFailToRegisterForRemoteNotificationsWithError(error)
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
