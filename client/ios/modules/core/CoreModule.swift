//
//  File.swift
//  berty
//
//  Created by Godefroy Ponsinet on 29/08/2018.
//

import Foundation
import os
import Core
import UserNotifications

enum CoreError: Error {
  case invalidOptions
}

var logger = Logger("chat.berty.io", "CoreModule")

@objc(CoreModule)
class CoreModule: NSObject {
  let connectivity = ConnectivityUpdateHandler()
  let serialCoreQueue = DispatchQueue(label: "BertyCore")
  let daemon: CoreNativeBridgeProtocol

  override init() {
    self.daemon = CoreNewNativeBridge(logger)!

    super.init()
  }

  @objc func invoke(_ method: NSString, message: NSString,
                    resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    var err: NSError?
    self.serialCoreQueue.sync {
      do {
        let ret = self.daemon.invoke(method as String, msgIn: message as String, error: &err)
        if let error = err {
          throw error
        }
        resolve(ret)
      } catch let error as NSError {
        reject("\(String(describing: error.code))", error.userInfo.description, error)
      }
    }
  }

  @objc func setCurrentRoute(_ route: String!) {
    CoreSetAppRoute(route)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func getNotificationStatus(_ resolve: @escaping RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let current = UNUserNotificationCenter.current()

    current.getNotificationSettings(completionHandler: { (settings) in
      resolve(settings.authorizationStatus.rawValue)
    })
  }

  @objc func openSettings(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!, options: [:], completionHandler: nil)
    }
  }
}
