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

    // didReceive and serviceExtensionTimeWillExpire run on different threads: the content
    // handler is only taken through takeContentHandler(), under this lock, so that it is
    // called at most once.
    private let lock = NSLock()
    private var contentHandler: ((UNNotificationContent) -> Void)?
    // set once in didReceive, then only read (by the fallback)
    private var bestAttemptContent: UNMutableNotificationContent?

    override init() {
        let config = BertypushNewConfig()!
        let preferredLanguages: String = Locale.preferredLanguages.joined(separator: ",")
        config.setPreferredLanguages(preferredLanguages)
        pushStandalone = BertypushNewPushStandalone(config)!
        super.init()
    }

    // Returns the content handler and clears it, atomically: only the first caller gets it.
    private func takeContentHandler() -> ((UNNotificationContent) -> Void)? {
        lock.lock()
        defer { lock.unlock() }
        let handler = self.contentHandler
        self.contentHandler = nil
        return handler
    }

    // The only way a notification is delivered (success, muted and fallback): the content is
    // only built, and the handler only called, by the caller that took the handler.
    private func deliver(_ makeContent: () -> UNNotificationContent) {
        guard let handler = takeContentHandler() else {
            os_log("notification already delivered", log: oslogger)
            return
        }
        handler(makeContent())
    }

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        os_log("didReceive encrypted notification", log: oslogger)

        lock.lock()
        self.contentHandler = contentHandler
        self.bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        lock.unlock()

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

        if decrypted.muted {
            deliver { UNNotificationContent() }
            return
        }

        deliver {
            // a copy of its own: bestAttemptContent may be read by the fallback at the same time
            guard let content = request.content.mutableCopy() as? UNMutableNotificationContent else {
                return UNNotificationContent()
            }
            content.title = decrypted.title
            content.body = decrypted.body

            if decrypted.deepLink != "" {
                content.userInfo["deepLink"] = decrypted.deepLink
            }

            if decrypted.subtitle != "" {
                content.subtitle = decrypted.subtitle
            }
            return content
        }
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

    // Called when the push cannot be decrypted (keychain not available yet, error, timeout).
    // Dropping it silently means the user never learns about the message, so display a
    // generic notification that doesn't leak anything instead.
    func displayFallback() {
        deliver {
            self.lock.lock()
            let best = self.bestAttemptContent
            self.lock.unlock()

            guard let content = best?.mutableCopy() as? UNMutableNotificationContent else {
                return UNNotificationContent()
            }
            if content.title.isEmpty && content.body.isEmpty {
                let bundle = self.getLocalizedBundle()
                content.title = "Berty"
                content.body = bundle?.localizedString(forKey: "notification.fallback.body", value: "You have a new message", table: nil) ?? "You have a new message"
            }
            return content
        }
    }
}
