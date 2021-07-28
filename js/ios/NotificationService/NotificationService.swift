//
//  NotificationService.swift
//  NotificationService
//
//  Created by Antoine Eddi on 7/24/21.
//

import UserNotifications
import OSLog

/* Minimum payload
 {
   "aps": {
     "alert": {
       "title": "."
     },
     "mutable-content": 1
   },
   "data": "<encrypted-data>"
 }
 */
class NotificationService: UNNotificationServiceExtension {
  var contentHandler: ((UNNotificationContent) -> Void)?
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    self.contentHandler = contentHandler

    var decryptedContent = UNMutableNotificationContent()
    var rootDir: String
    
    do {
      rootDir = try RootDirGet()
    } catch {
      NSLog("Getting root dir failed: \(error.localizedDescription)")
      serviceExtensionTimeWillExpire()
      return
    }

    NSLog("TOTOLOLEXT: \(rootDir)")
//    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
//    NSLog("RECEIVEDLOL \(request)")
//    NSLog("RECEIVEDLOL \(request.content)")
//    NSLog("RECEIVEDLOL \(request.content.userInfo)")
//
//    if let bestAttemptContent = bestAttemptContent {
//      bestAttemptContent.title = "\(bestAttemptContent.title) [modified]"
      
//      contentHandler(bestAttemptContent)
//    }
  }
  
  // This callback will be called by iOS if data decryption took to much time
  override func serviceExtensionTimeWillExpire() {
    if let contentHandler = contentHandler {
      let fallbackContent = UNMutableNotificationContent()
      fallbackContent.title = "Fallback Title"
      fallbackContent.subtitle = "Fallback Subtitle"
      fallbackContent.body = "Fallback Body"
      
      // Display fallback content
      contentHandler(fallbackContent)
    }
  }
}
