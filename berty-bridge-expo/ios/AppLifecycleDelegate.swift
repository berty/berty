//
//  AppLifecycleDelegate.swift
//  Pods
//
//  Created by Rémi BARBERO on 07/11/2025.
//

import ExpoModulesCore
import Bertybridge

public class AppLifecycleDelegate: ExpoAppDelegateSubscriber {
    public func application(_ application: UIApplication,
                            didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        PushTokenRequester.shared.onRequestSucceeded(deviceToken)
    }

    public func application(_ application: UIApplication,
                            didFailToRegisterForRemoteNotificationsWithError
                            error: Error) {
        PushTokenRequester.shared.onRequestFailed(error)
    }
    
    public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        LifeCycle.shared.registerBackgroundTask(identifier: "tech.berty.ios.task.gobridge-process")
        LifeCycle.shared.registerBackgroundTask(identifier: "tech.berty.ios.task.gobridge-refresh")
        
        return true
    }
    
    // Custom lifecycle handlers
    
    public func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        LifeCycle.shared.startBackgroundTask(cancelAfter: 25, completionHandler: completionHandler)
    }
    
    public func applicationDidEnterBackground(_ application: UIApplication) {
        LifeCycle.shared.scheduleBackgroundProcessing(identifier: "tech.berty.ios.task.gobridge-process")
        LifeCycle.shared.scheduleAppRefresh(identifier: "tech.berty.ios.task.gobridge-refresh")
        LifeCycle.shared.updateState(state: UIApplication.State.background)
    }
    
    public func applicationDidBecomeActive(_ application: UIApplication) {
        LifeCycle.shared.updateState(state: UIApplication.State.active)
    }
    
    public func applicationWillResignActive(_ application: UIApplication) {
        LifeCycle.shared.updateState(state: UIApplication.State.inactive)
    }
    
    public func applicationWillTerminate(_ application: UIApplication) {
        LifeCycle.shared.willTerminate()
    }
    
    public func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        completionHandler(.newData)
    }
    
    // Push notifications
    public func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo

        if let deepLink = userInfo["deepLink"] as? String,
           let url = URL(string: deepLink) {
            UIApplication.shared.open(url, options: [:]) { _ in
                completionHandler()
            }
            return
        }
        
        completionHandler();
    }
    
    public func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if let payload = notification.request.content.userInfo[BertybridgeServicePushPayloadKey] as? String {
//                if let eventEmitter = EventEmitter.shared {
//                    // Send the payload to JS
//                    eventEmitter.sendEvent(withName: "onPushReceived", body: payload)
//                }
            }

            // Ignore push notif from here, JS will decide to display it or not
            completionHandler([])
    }
}
