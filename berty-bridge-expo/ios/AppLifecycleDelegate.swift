//
//  AppLifecycleDelegate.swift
//  Pods
//
//  Created by Rémi BARBERO on 07/11/2025.
//

import ExpoModulesCore

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
}
