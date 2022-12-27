//
//  LifeCycle.swift
//  Berty Debug
//
//  Created by Guilhem Fanton on 08/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import UserNotifications
import Foundation
import BackgroundTasks

class LifeCycle: NSObject {
    static let shared: LifeCycle = LifeCycle()

    @objc static func getSharedInstance() -> LifeCycle {
        return LifeCycle.shared
    }

    @available(iOS 13.0, *)
    @objc
    public func registerBackgroundTask(identifier: String) {
        BertyLogger.info("register background fetch task \(identifier)")
        BGTaskScheduler.shared.register(forTaskWithIdentifier: identifier, using: nil) { (task) in
            switch task {
            case is BGProcessingTask:
                self.scheduleBackgroundProcessing(identifier: identifier)
            case is BGAppRefreshTask:
                self.scheduleAppRefresh(identifier: identifier)
            default:
                break
            }

            self.handle(task: task)
        }
    }

    @available(iOS 13.0, *)
    func handle(task: BGTask) {
        guard let bgtask = LifeCycleDriver.shared.handleBackgroundTask() else {
            BertyLogger.error("unable to get handlers")
            task.setTaskCompleted(success: false)
            return
        }

        task.expirationHandler = {
            BertyLogger.info("handle expiracy")
            bgtask.cancel()
        }

        DispatchQueue.global(qos: .background).async {
            BertyLogger.info("starting background task")
            let success = bgtask.execute()
            DispatchQueue.main.async {
                BertyLogger.info("ending background with: success=\(success)")
                task.setTaskCompleted(success: success)
            }
        }
    }

    @available(iOS 13.0, *)
    @objc
    func scheduleAppRefresh(identifier: String) {
        let request = BGAppRefreshTaskRequest(identifier: identifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 60)
        do {
            BertyLogger.info("scheduling app refresh")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            BertyLogger.error("unable to submit task: %@")
        }
    }

    @available(iOS 13.0, *)
    @objc
    func scheduleBackgroundProcessing(identifier: String) {
        let request = BGProcessingTaskRequest(identifier: identifier)
        request.requiresNetworkConnectivity = true
        do {
            BertyLogger.info("scheduling app processing")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            BertyLogger.error("unable to submit task: %@")
        }
    }

    @objc
    func startBackgroundTask(cancelAfter: Int, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        guard let bgtask = LifeCycleDriver.shared.handleBackgroundTask() else {
            BertyLogger.error("unable to get handler")
            completionHandler(.noData)
            return
        }

        if cancelAfter > 0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(cancelAfter)) {
                bgtask.cancel()
            }
        }

        let success = bgtask.execute()
        if success {
            completionHandler(.newData)
        } else {
            completionHandler(.failed)
        }
    }

    @objc
    func updateState(state: UIApplication.State) {
        LifeCycleDriver.shared.updateState(state: state)
    }

    @objc
    func willTerminate() {
        BertyLogger.info("will terminate")
        LifeCycleDriver.shared.willTerminate()
    }
}
