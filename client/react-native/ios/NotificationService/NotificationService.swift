//
//  NotificationService.swift
//  NotificationService
//
//  Created by Godefroy Ponsinet on 29/01/2019.
//  Copyright © 2019 Berty Technologies. All rights reserved.
//

import UserNotifications
import Core

class NotificationService: UNNotificationServiceExtension {

  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    do {
      let json = try JSONSerialization.data(withJSONObject: request.content.userInfo, options: [])
      let data = String(decoding: json, as: UTF8.self)
      try Core.deviceInfo().setStoragePath(FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?.path)
      Core.notificationDriver()?.receive(data)
    } catch {
      // logger.format("failed to deserialize remote notification : %@", level: .error, error.localizedDescription)
    }

    self.contentHandler = contentHandler
    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

    if let bestAttemptContent = bestAttemptContent {
      // Modify the notification content here...
      bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"

      contentHandler(bestAttemptContent)
    }
  }

  override func serviceExtensionTimeWillExpire() {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }

}
