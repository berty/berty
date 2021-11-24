//
//  NotificationService.swift
//  NotificationService
//
//  Created by Antoine Eddi on 7/24/21.
//

import Bertypush
import UserNotifications
import OSLog

struct PayloadAttrs: Codable {
    let message: String
}

class NotificationService: UNNotificationServiceExtension, BertypushPrinterProtocol {
  let oslogger = OSLog(subsystem: "tech.berty.ios.notif", category: "notif")

  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  func print(_ msg: String?) {
    os_log("golog: %{public}@", log: oslogger, msg!)
  }

  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    os_log("didReceive encrypted notification", log: oslogger)

    self.contentHandler = contentHandler
    self.bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

    var rootDir: String
    do {
      rootDir = try RootDirGet()
    } catch {
      os_log("getting root dir failed: %@", log: oslogger, type: .error, error.localizedDescription)
      displayFallback()
      return
    }

    guard let data = request.content.userInfo[BertypushServicePushPayloadKey] as? String else {
      os_log("No filed 'data' found in received push notification", log: oslogger, type: .error)
      displayFallback()
      return
    }

    os_log("starting push decrypt", log: oslogger)

    var storageKey: Data
    do {
      storageKey = try KeystoreDriver.shared.get(BertypushStorageKeyName)
    } catch {
      os_log("getting storage key failed: %@", log: oslogger, type: .error, error.localizedDescription)
      displayFallback()
      return
    }

    var error: NSError?
    guard let decrypted = BertypushPushDecryptStandaloneWithLogger(self, rootDir, data, storageKey, &error) else {
       if let error = error {
          os_log("Push notif decryption failed: %{public}@", log: oslogger, error.localizedDescription)
       } else {
          os_log("Push notif decryption failed without returning error", log: oslogger)
       }
       displayFallback()
       return
    }

    os_log("successfully decrypt push", log: oslogger)

    guard let payloadAttrs = decrypted.payloadAttrsJSON.data(using: .utf8) else {
      os_log("failed to get json payload attrs: %@", log: oslogger, type: .error)
      displayFallback()
      return
    }

    let payload: PayloadAttrs
    do {
      payload = try JSONDecoder().decode(PayloadAttrs.self, from: payloadAttrs)
    } catch {
      os_log("failed to get unmarshall json payload attrs: %@", log: oslogger, type: .error, error.localizedDescription)
      displayFallback()
      return
    }

    // TODO: implement display logic
    self.bestAttemptContent!.title = decrypted.memberDisplayName
    self.bestAttemptContent!.body = payload.message
    self.bestAttemptContent!.userInfo["deepLink"] = decrypted.deepLink
    contentHandler(self.bestAttemptContent!)
  }

  // This callback will be called by iOS if data decryption took to much time
  override func serviceExtensionTimeWillExpire() {
    os_log("push notif decryption timed out", log: oslogger, type: .error)
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
