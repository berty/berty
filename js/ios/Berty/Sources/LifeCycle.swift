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
    // init logger driver
    static let shared: LifeCycle = LifeCycle()
    let logger: LoggerDriver = LoggerDriver("tech.berty", "lifecycle")

    @objc static func getSharedInstance() -> LifeCycle {
        return LifeCycle.shared
    }

    @available(iOS 13.0, *)
    @objc
    public func registerBackgroundTask(identifier: String) {
        self.logger.print("register background fetch task \(identifier)" as NSString)
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
            self.logger.print("unable to get handlers", level: .error)
            task.setTaskCompleted(success: false)
            return
        }

        task.expirationHandler = {
            self.logger.print("handle expiracy")
            bgtask.cancel()
        }

        DispatchQueue.global(qos: .background).async {
            self.logger.print("starting background task")
            let success = bgtask.execute()
            DispatchQueue.main.async {
                self.logger.format("ending background with: success=\(success)" as NSString)
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
            self.logger.print("scheduling app refresh")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            self.logger.format("unable to submit task: %@", level: .error, error.localizedDescription)
        }
    }

    @available(iOS 13.0, *)
    @objc
    func scheduleBackgroundProcessing(identifier: String) {
        let request = BGProcessingTaskRequest(identifier: identifier)
        request.requiresNetworkConnectivity = true
        do {
            self.logger.print("scheduling app processing")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            self.logger.format("unable to submit task: %@", level: .error, error.localizedDescription)
        }
    }

    @objc
    func startBackgroundTask(cancelAfter: Int, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        guard let bgtask = LifeCycleDriver.shared.handleBackgroundTask() else {
            self.logger.print("unable to get handler", level: .error)
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
        self.logger.print("will terminate")
        LifeCycleDriver.shared.willTerminate()
    }
}
