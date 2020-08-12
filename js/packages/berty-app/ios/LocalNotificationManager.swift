//
//  LocalNotificationManager.swift
//  Berty
//
//  Created by Guilhem Fanton on 18/08/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import UserNotifications
import go_bridge

// LocalNotificationManager temporary used to display notification
// while in background for testing purpose
@available(iOS 13.0, *)
class LocalNotificationManager: NSObject {
  let identifier: String
  var title: String = "No Title"
  var body: String = ""
  var interval: TimeInterval = 1

  @available(iOS 13.0, *)
  @objc
  static func requestPermission() -> Void {
      UNUserNotificationCenter
          .current()
          .requestAuthorization(options: [.alert, .badge, .alert]) { granted, error in
              if granted != true || error != nil {
                  print("Unable to request notification")
              }
      }
  }

  init(id: String) {
    self.identifier = id
    super.init()
  }

  func setTitle(title: String) -> LocalNotificationManager {
    self.title = title
    return self
  }

  func setBody(body: String) -> LocalNotificationManager {
    self.body = body
    return self
  }

  func setInterval(interval: TimeInterval) -> LocalNotificationManager {
    self.interval = interval
    return self
  }

  func schedule() {
    let content = UNMutableNotificationContent()
    content.title = self.title
    content.body = self.body

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: self.interval, repeats: false)
    let request = UNNotificationRequest(identifier: self.identifier, content: content, trigger: trigger)
    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        print("unable to schedule notification: \(error.localizedDescription)")
        return
      }
      print("Scheduling notification with id: \(self.identifier)")
    }
  }
}
