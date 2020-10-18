
//
//  NotificationDriver.swift
//  go-bridge
//
//  Created by Guilhem Fanton on 07/09/2020.
//

import Foundation
import Bertybridge
import UserNotifications
import CoreMotion

public class NotificationDriver: NSObject, BertybridgeNotificationDriverProtocol {
    public static var shared: NotificationDriver = NotificationDriver()
    public static var identifier: String = "tech.berty.ios.bridge.notification"
    let logger: LoggerDriver = LoggerDriver("tech.berty", "notif")

    func set(identifier: String) {
        NotificationDriver.identifier = identifier
    }

    func schedule(_ notif: BertybridgeLocalNotification) {
        let content = UNMutableNotificationContent()
        content.title = notif.title
        content.body = notif.body

        var trigger: UNNotificationTrigger? = nil
        if notif.interval > 0.0 {
            trigger = UNTimeIntervalNotificationTrigger(timeInterval: notif.interval, repeats: false)
        }

        let request = UNNotificationRequest(identifier: NotificationDriver.identifier, content: content, trigger: trigger)

        UNUserNotificationCenter.current().add(request) { [weak self] error in
            if let error = error {
                self!.logger.print("unable to schedule notification: \(error.localizedDescription)" as NSString, level: .warn)
                return
            }
        }
    }

    public func post(_ notif: BertybridgeLocalNotification?) throws {
        guard let notif = notif else {
            throw BridgeError("Empty notification request")
        }

        UNUserNotificationCenter.current().getNotificationSettings { settings in
            switch settings.authorizationStatus {
            case .authorized, .provisional:
                self.schedule(notif)
            default:
                self.logger.print("unable to schedule notification, permission not granted", level: .warn)
                break
            }
        }
    }
}
