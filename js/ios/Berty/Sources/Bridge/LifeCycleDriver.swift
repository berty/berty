//
//  LifeCycleDriver.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 11/08/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

public enum AppState {
    case background
    case inactive
    case active
}

public class LifeCycleDriver: NSObject, BertybridgeLifeCycleDriverProtocol {
    public static var shared: LifeCycleDriver = LifeCycleDriver()
    var handler: BertybridgeLifeCycleHandlerProtocol? = nil
    let logger: LoggerDriver = LoggerDriver("tech.berty", "lifecycle")

    public func register(_ handler: BertybridgeLifeCycleHandlerProtocol?) {
        self.handler = handler
    }

    public func getCurrentState() -> Int {
        if (Thread.current.isMainThread) {
            return UIApplication.shared.applicationState.getBridgeState()
        }

        return BertybridgeAppStateUnknown
    }

    public func handleBackgroundTask() -> BertybridgeLifeCycleBackgroundTaskProtocol? {
        return self.handler?.handleTask()
    }

    public func updateState(state: UIApplication.State) {
        if let handler = self.handler {
            handler.handleState(state.getBridgeState())
        } else {
            self.logger.print("no state handler set", level: .warn)
        }
    }

    public func willTerminate() {
        if let handler = self.handler {
            handler.willTerminate()
        } else {
            self.logger.print("no state handler set", level: .warn)

        }
    }
}

extension UIApplication.State {
    func getBridgeState() -> Int {
        switch self {
        case .active:
            return BertybridgeAppStateActive
        case .background:
            return BertybridgeAppStateBackground
        case .inactive:
            return BertybridgeAppStateInactive
        default:
            return BertybridgeAppStateUnknown
        }
    }
}
