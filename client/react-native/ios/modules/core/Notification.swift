//
//  ViewController.swift
//  NotificationExample
//
//  Created by Belal Khan on 13/01/18.
//  Copyright © 2018 Belal Khan. All rights reserved.
//

import UIKit
import UserNotifications

class ViewController: UIViewController, UNUserNotificationCenterDelegate, CoreNativeNotificationProtocol {

    override func viewDidLoad() {
        super.viewDidLoad()

        //requesting for authorization
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge], completionHandler: {didAllow, error in

        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {

        //displaying the ios local notification when app is in foreground
        completionHandler([.alert, .badge, .sound])
    }


}
