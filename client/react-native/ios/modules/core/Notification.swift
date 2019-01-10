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

class Notification: NSObject, UNUserNotificationCenterDelegate, CoreNativeNotificationProtocol {

  @objc var handler: CoreMobileNotification!

  init(handler: CoreMobileNotification!) {
    super.init()
    self.handler = handler

    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self

      // Requesting for authorization
      // FIXME: these action doesn't belong here, improve this and make it
      // available for < ios10.0
      UNUserNotificationCenter.current().requestAuthorization(
        options: [.alert, .sound, .badge],
        completionHandler: { _, _ in }
      )
    }
  }

  @available(iOS 10.0, *)
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler:
                                @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.alert, .badge, .sound])
  }

  func display(_ title: String?, body: String?, icon: String?, sound: String?) throws {
    guard let utitle = title, let ubody = body else {
      throw NotificationError.invalidArgument
    }

    if #available(iOS 10.0, *) {

      let center = UNUserNotificationCenter.current()
      let content = UNMutableNotificationContent()
      content.title = utitle
      content.body = ubody
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
}
