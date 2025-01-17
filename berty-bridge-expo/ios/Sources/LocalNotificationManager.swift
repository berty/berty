//
//  LocalNotificationManager.swift
//  Berty
//
//  Created by Guilhem Fanton on 18/08/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import UserNotifications

// LocalNotificationManager temporary used to display notification
// while in background for testing purpose
@available(iOS 13.0, *)
@objc
class LocalNotificationManager: NSObject {
  @available(iOS 13.0, *)
  @objc
  static func requestPermission() -> Void {
      UNUserNotificationCenter
          .current()
          .requestAuthorization(options: [.alert, .badge]) { granted, error in
              if granted != true || error != nil {
                  print("Unable to request notification")
              }
      }
  }
}
