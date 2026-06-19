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
import UIKit

class LifeCycle: NSObject {
    static let shared: LifeCycle = LifeCycle()
    let logger: BertyLogger = BertyLogger("tech.berty.lifecycle")

    // Serial off-main queue for the blocking Bridge.HandleState calls (ordered, off the watchdog'd main thread).
    private let stateQueue = DispatchQueue(label: "tech.berty.lifecycle.state")

    @objc static func getSharedInstance() -> LifeCycle {
        return LifeCycle.shared
    }

    // Run a blocking lifecycle call off-main under a background-task assertion (iOS grants ~30s instead of ~5s).
    private func runOffMain(name: String, _ work: @escaping () -> Void) {
        var bgTaskID: UIBackgroundTaskIdentifier = .invalid
        bgTaskID = UIApplication.shared.beginBackgroundTask(withName: name) {
            if bgTaskID != .invalid {
                UIApplication.shared.endBackgroundTask(bgTaskID)
                bgTaskID = .invalid
            }
        }

        self.stateQueue.async {
            work()
            if bgTaskID != .invalid {
                UIApplication.shared.endBackgroundTask(bgTaskID)
                bgTaskID = .invalid
            }
        }
    }

    @available(iOS 13.0, *)
    @objc
    public func registerBackgroundTask(identifier: String) {
        self.logger.info("register background fetch task \(identifier)")
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
            self.logger.error("unable to get handlers")
            task.setTaskCompleted(success: false)
            return
        }

        task.expirationHandler = {
            self.logger.info("handle expiracy")
            bgtask.cancel()
        }

        DispatchQueue.global(qos: .background).async {
            self.logger.info("starting background task")
            let success = bgtask.execute()
            DispatchQueue.main.async {
                self.logger.info("ending background with: success=\(success)")
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
            self.logger.info("scheduling app refresh")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            self.logger.error("unable to submit task: \(error.localizedDescription)")
        }
    }

    @available(iOS 13.0, *)
    @objc
    func scheduleBackgroundProcessing(identifier: String) {
        let request = BGProcessingTaskRequest(identifier: identifier)
        request.requiresNetworkConnectivity = true
        do {
            self.logger.info("scheduling app processing")
            try BGTaskScheduler.shared.submit(request)
        } catch {
            self.logger.error("unable to submit task: \(error.localizedDescription)")
        }
    }

    @objc
    func startBackgroundTask(cancelAfter: Int, completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        guard let bgtask = LifeCycleDriver.shared.handleBackgroundTask() else {
            self.logger.error("unable to get handler")
            completionHandler(.noData)
            return
        }

        if cancelAfter > 0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(cancelAfter)) {
                bgtask.cancel()
            }
        }

        // `execute()` blocks until the Go task finishes; keep it off-main to avoid the watchdog.
        DispatchQueue.global(qos: .background).async {
            let success = bgtask.execute()
            DispatchQueue.main.async {
                completionHandler(success ? .newData : .failed)
            }
        }
    }

    @objc
    func updateState(state: UIApplication.State) {
        self.runOffMain(name: "tech.berty.lifecycle.state") {
            LifeCycleDriver.shared.updateState(state: state)
        }
    }

    @objc
    func willTerminate() {
        self.logger.info("will terminate")
        self.runOffMain(name: "tech.berty.lifecycle.terminate") {
            LifeCycleDriver.shared.willTerminate()
        }
    }
}
