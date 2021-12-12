//
//  NotificationService.swift
//  NotificationService
//
//  Created by Antoine Eddi on 7/24/21.
//

import Bertypush
import UserNotifications
import OSLog

class LoggerDriver: NSObject, BertypushLoggerDriverProtocol {
    let logger: OSLog

    init(_ logger: OSLog){
        self.logger = logger
    }

    @objc func print(_ msg: String?) {
        os_log("golog: %{public}@", log: self.logger, msg!)
    }
}

class NotificationService: UNNotificationServiceExtension {
    let oslogger = OSLog(subsystem: "tech.berty.ios.notif", category: "gomobile")
    let pushStandalone: BertypushPushStandalone

    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override init() {
        let config = BertypushNewConfig()!
        let preferredLanguages: String = Locale.preferredLanguages.joined(separator: ",")
        config.setPreferredLanguages(preferredLanguages)
        config.setLoggerDriver(LoggerDriver(oslogger))
        pushStandalone = BertypushNewPushStandalone(config)!
        super.init()
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

        var decrypted: BertypushFormatedPush
        do {
            decrypted = try self.pushStandalone.decrypt(rootDir, inputB64: data, ks: KeystoreDriver.shared)
        } catch {
            os_log("Push notif decryption failed: %@", log: oslogger, type: .error, error.localizedDescription)
            displayFallback()
            return
        }

        os_log("successfully decrypt push", log: oslogger)

        self.bestAttemptContent!.title = decrypted.title
        self.bestAttemptContent!.body = decrypted.body

        if decrypted.deepLink != "" {
            self.bestAttemptContent!.userInfo["deepLink"] = decrypted.deepLink
        }

        if decrypted.subtitle != "" {
            self.bestAttemptContent!.subtitle = decrypted.subtitle
        }

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
