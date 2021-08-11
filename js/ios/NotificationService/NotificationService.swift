//
//  NotificationService.swift
//  NotificationService
//
//  Created by Antoine Eddi on 7/24/21.
//

import UserNotifications
import OSLog
import Bertybridge

class NotificationService: UNNotificationServiceExtension {
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    self.contentHandler = contentHandler
    self.bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        
    var rootDir: String
    do {
      rootDir = try RootDirGet()
    } catch {
      NSLog("Getting root dir failed: \(error.localizedDescription)")
      displayFallback()
      return
    }

    guard let data = request.content.userInfo["data"] as? String else {
      NSLog("No filed 'data' found in received push notification")
      displayFallback()
      return
    }
    
    var error: NSError?
    guard let decrypted = BertybridgePushDecryptStandalone(rootDir, data, &error) else {
      if let error = error {
        NSLog("Push notif decryption failed: \(error.localizedDescription)")
      } else {
        NSLog("Push notif decryption failed without returning error")
      }
      displayFallback()
      return
    }
    
    // TODO: implement display logic
    self.bestAttemptContent!.title = "Decrypted"
    self.bestAttemptContent!.subtitle = request.content.userInfo["data"] as! String
    self.bestAttemptContent!.body = "\(decrypted!.accountName) \(decrypted!.accountID) \(decrypted!.memberDisplayName) \(decrypted!.payloadAttrsJSON)"
    contentHandler(self.bestAttemptContent!)
  }

  // This callback will be called by iOS if data decryption took to much time
  override func serviceExtensionTimeWillExpire() {
    NSLog("Push notif decryption timed out")
    displayFallback()
  }
  
  func displayFallback() {
    // TODO: add i18n
    self.bestAttemptContent!.title = "Fallback Title"
    self.bestAttemptContent!.subtitle = "Fallback Subtitle"
    self.bestAttemptContent!.body = "Fallback Body"

    // Display fallback content
    self.contentHandler!(self.bestAttemptContent!)
  }
}
