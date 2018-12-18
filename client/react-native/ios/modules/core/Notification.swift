//
//  ViewController.swift
//  NotificationExample
//
//  Created by Belal Khan on 13/01/18.
//  Copyright © 2018 Belal Khan. All rights reserved.
//

import UIKit
import UserNotifications

enum NotificationError: Error {
    case invalidArgument
}

class Notitification: NSObject, UNUserNotificationCenterDelegate, CoreNativeNotificationProtocol {

  override init() {
        super.init()
    
        // @FIXME: thene action doesn't belong here
        if #available(iOS 10.0, *) {
            UNUserNotificationCenter.current().delegate = self
            //requesting for authorization
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge], completionHandler: {didAllow, error in
                                                                                                       })
        }
    }

    @available(iOS 10.0, *)
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
      completionHandler([.alert, .badge, .sound])
    }
  
    func display(_ title: String?, body: String?, icon: String?, sound: String?) throws {
        guard
          let utitle = title,
          let ubody = body
        else { throw NotificationError.invalidArgument }


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
