//
//  File.swift
//  berty
//
//  Created by Godefroy Ponsinet on 29/08/2018.
//

import Foundation
import os

var logger = Logger("chat.berty.io", "CoreModule")

@objc(CoreModule)
class CoreModule: NSObject {

    func getFilesDir() throws -> String {
      let filesDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
      let filesPath = filesDir?.path
      let fileExist = FileManager.default.fileExists(atPath: filesPath!)
      
      if fileExist == false {
          try FileManager.default.createDirectory(at: filesDir!, withIntermediateDirectories: true, attributes: nil)
      }
  
      return filesPath!
    }
  
    @objc func start(_ resolve: RCTPromiseResolveBlock!,  reject: RCTPromiseRejectBlock!) {
        var err: NSError?

        do {
            CoreStart(try self.getFilesDir(), logger, &err)
            if let error = err {
                throw error
            }
            resolve(nil)
        } catch let error as NSError {
            logger.format("core module start error: %@", level: .Error, error.userInfo.description)
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
  
    @objc func restart(_ resolve: RCTPromiseResolveBlock!,  reject: RCTPromiseRejectBlock!) {
      var err: NSError?
      
      do {
          CoreRestart(try self.getFilesDir(), logger, &err)
          if let error = err {
              throw error
          }
          resolve(nil)
      } catch let error as NSError {
          logger.format("core module restart error: %@", level: .Error, error.userInfo.description)
          reject("\(String(describing: error.code))", error.userInfo.description, error)
      }
    }
  
    @objc func getPort(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        var err: NSError?
        var port: Int = 0

        CoreGetPort(&port, &err)
        if let error = err {
            logger.format("get port error: ", level: .Error, error.userInfo.description)
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
        resolve(port)
    }

    @objc func getNetworkConfig(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        var err: NSError?

        let config: String = CoreGetNetworkConfig(&err)
        if let error = err {
            logger.format("get network config error: ", level: .Error, error.userInfo.description)
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
        resolve(config)
    }

    @objc func updateNetworkConfig(_ config: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        var err: NSError?

        CoreUpdateNetworkConfig(config, &err)
        if let error = err {
            logger.format("update network config error: ", level: .Error, error.userInfo.description)
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
        resolve(nil)
    }
}
