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
        #if !CFG_APPSTORE
        config.setLoggerDriver(LoggerDriver(oslogger))
        #endif
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

    // getLocalizedBundle tries to load the localized Bundle corresponding to the app language.
    //
    // The notificationService app extension doesn't get automatically the app language from UserDefaults until it restarts. So the Berty app puts the correct language to the Common database (shared between Berty app and NotificationService) and getLocalizedBundle loads the corresponding bundle from this database.
    // The language format from Common can be [languageCode]-[regionCode] (e.g: en-US), and the localized lproj directories have the format [languageCode] (e.g: en). So we have to remove the region code to find the correct bundle path.
    func getLocalizedBundle() -> Bundle?{
        var bundle: Bundle?

        do {
            var languages = (try Common.userDefaults().object(forKey: "AppleLanguages") as! [String]?) ?? []
            languages.append("en") // force english as fallback language

            for language in languages {
                let codeLanguage = Locale(identifier: language).languageCode
                let path = Bundle.main.path(forResource: codeLanguage, ofType: "lproj")
                if (path != nil) {
                    bundle = Bundle(path: path!)
                    break
                }
            }
        } catch {
            os_log("language sync with app failed: %@", log: oslogger, type: .error, error.localizedDescription)
        }

        return bundle
    }

    func displayFallback() {
        let bundle = getLocalizedBundle()

        let defaultPushMessage = NSLocalizedString("BertyPushMessage", tableName: nil, bundle: bundle!, value: "", comment: "default push title")
        let defaultPushMessageError = NSLocalizedString("BertyPushMessageError", tableName: nil, bundle: bundle!, value: "", comment: "default push decryption error")

        self.bestAttemptContent!.title = defaultPushMessage
        self.bestAttemptContent!.subtitle = ""
        self.bestAttemptContent!.body = defaultPushMessageError

        // Display fallback content
        self.contentHandler!(self.bestAttemptContent!)
    }
}
