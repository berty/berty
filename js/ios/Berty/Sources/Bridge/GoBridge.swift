//
//  GoBridge.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

struct BridgeError: LocalizedError {
    let value: String
    init(_ value: String)  {
        self.value = value
    }
    public var errorDescription: String? { return self.value }
}

@objc(GoBridge)
class GoBridge: NSObject {
    let logger = LoggerDriver("tech.berty", "react")

    // protocol
    var bridgeMessenger: BertybridgeBridge?
    let rootDir: String

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        // set berty dir for persistence
        self.rootDir = try! RootDirGet()

        super.init()
    }

    deinit {
      do {
        if self.bridgeMessenger != nil {
            NSLog("bflifecycle: calling try self.bridgeMessenger?.close()")
            try self.bridgeMessenger?.close()
            NSLog("bflifecycle: done try self.bridgeMessenger?.close()")
            self.bridgeMessenger = nil
        }
      } catch let error as NSError {
        NSLog("\(String(describing: error.code))")
      }
    }

    @objc func clearStorage(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if FileManager.default.fileExists(atPath: self.rootDir) {
                try FileManager.default.removeItem(atPath: self.rootDir)
            }
            resolve(true)
        }
        catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func log(_ opts: NSDictionary) {
        if let message = opts["message"] as? String {
            let type = opts["level"] as? String ?? "info"

            // set log level
            let level = Level(rawValue: type.uppercased()) ?? Level.info

            // log
            self.logger.print(message as NSString, level: level, category: "react-native")
        }
    }

    // //////// //
    // Protocol //
    // //////// //

    @objc func initBridge(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeMessenger != nil {
                throw NSError(domain: "tech.berty.gobridge", code: 1, userInfo: [NSLocalizedDescriptionKey : "already started"])
            }

            var err: NSError?
            guard let config = BertybridgeNewConfig() else {
                throw NSError(domain: "tech.berty.gobridge", code: 2, userInfo: [NSLocalizedDescriptionKey : "unable to create config"])
            }

            config.setLoggerDriver(LoggerDriver("tech.berty", "protocol"))
            config.setLifeCycleDriver(LifeCycleDriver.shared)
            config.setNotificationDriver(NotificationDriver.shared)
            config.setKeystoreDriver(KeystoreDriver.shared)

            // @TODO(gfanton): make this dir in golang
            var isDirectory: ObjCBool = true
            let exist = FileManager.default.fileExists(atPath: self.rootDir, isDirectory: &isDirectory)
            if !exist {
                try FileManager.default.createDirectory(atPath: self.rootDir, withIntermediateDirectories: true, attributes: nil)
            }
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            try self.rootdir.setResourceValues(values)

            NSLog("root dir: `%@`", self.rootDir)
            config.setRootDir(self.rootDir)

            NSLog("bflifecycle: calling BridgeNewMessengerBridge")
            let bridgeMessenger = BertybridgeNewBridge(config, &err)
            NSLog("bflifecycle: done BridgeNewMessengerBridge")
            if err != nil {
                throw err!
            }

            self.bridgeMessenger = bridgeMessenger

            resolve(true)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func closeBridge(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeMessenger != nil {
                NSLog("bflifecycle: calling try self.messengerProtocol?.close()")
                try self.bridgeMessenger?.close()
                NSLog("bflifecycle: done try self.bridgeMessenger?.close()")
                self.bridgeMessenger = nil
            }
            resolve(true)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func invokeBridgeMethod(_ method: String, b64message: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            guard let bridgeMessenger = self.bridgeMessenger else {
                throw NSError(domain: "tech.berty.gobridge", code: 3, userInfo: [NSLocalizedDescriptionKey : "bridgeMessenger isn't started"])
            }

            let promise = PromiseBlock(resolve, reject)
            bridgeMessenger.invokeBridgeMethod(with: promise, method: method, b64message: b64message)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func getProtocolAddr(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
          if self.bridgeMessenger == nil {
              throw NSError(domain: "tech.berty.gobridge", code: 4, userInfo: [NSLocalizedDescriptionKey : "bridgeMessenger isn't started"])
          }

          let addr: [String] = []
          resolve(addr)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
}
