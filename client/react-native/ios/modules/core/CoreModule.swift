//
//  File.swift
//  berty
//
//  Created by Godefroy Ponsinet on 29/08/2018.
//

import Foundation
import os
import Core

enum CoreError: Error {
  case invalidOptions
}

var logger = Logger("chat.berty.io", "CoreModule")

@objc(CoreModule)
class CoreModule: NSObject {

  @objc var notificationDriver: CoreMobileNotification! = Core.notificationDriver()

  override init() {
    super.init()
    self.notificationDriver.setNative(Notification(handler: self.notificationDriver))
  }

  func getFilesDir() throws -> String {
    let filesDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
    let filesPath = filesDir?.path
    let fileExist = FileManager.default.fileExists(atPath: filesPath!)

    if fileExist == false {
      try FileManager.default.createDirectory(at: filesDir!, withIntermediateDirectories: true, attributes: nil)
    }
    return filesPath!
  }

  @objc func initialize(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    var err: NSError?

    do {
      CoreInitialize(logger, try self.getFilesDir(), &err)
      if let error = err {
        throw error
      }
      resolve(nil)
    } catch let error as NSError {
      logger.format("unable to init core: %@", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.userInfo.description, error)
    }
  }

  @objc func listAccounts(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    var err: NSError?

    do {
      let list = CoreListAccounts(try self.getFilesDir(), &err)
      if let error = err {
        throw error
      }
      resolve(list)
    } catch let error as NSError {
      logger.format("unable to list accounts: %@", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.userInfo.description, error)
    }
  }

  @objc func start(_ nickname: NSString, resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    var err: NSError?

    do {
      let datastore = try self.getFilesDir()

      guard let coreOptions = CoreMobileOptions()?
        .withDatastorePath(datastore)?
        .withLoggerDriver(logger)?
        .withNickname(nickname as String)
        else {
          throw CoreError.invalidOptions
      }

      CoreStart(coreOptions, &err)
      if let error = err {
        throw error
      }
      resolve(nil)
    } catch let error as NSError {
      logger.format("unable to start core: %@", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    }
  }

  @objc func restart(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    var err: NSError?

    do {
      CoreRestart(&err)
      if let error = err {
        throw error
      }
      resolve(nil)
    } catch let error as NSError {
      logger.format("unable to restart core: %@", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    }
  }

  @objc func panic(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
    CorePanic()
    resolve(nil)
  }

  @objc func dropDatabase(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {

    var err: NSError?

    do {
      CoreDropDatabase(try self.getFilesDir(), &err)
      if let error = err {
        throw error
      }
      resolve(nil)
    } catch let error as NSError {
      logger.format("unable to drop database: %@", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    }
  }

  @objc func getPort(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?
    var port: Int = 0

    CoreGetPort(&port, &err)
    if let error = err {
      logger.format("unable to get port: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(port)
    }
  }

  @objc func getNetworkConfig(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(CoreGetNetworkConfig())
  }

  @objc func updateNetworkConfig(_ config: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?

    CoreUpdateNetworkConfig(config, &err)
    if let error = err {
      logger.format("update network config error: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(nil)
    }
  }

  @objc func isBotRunning(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(CoreIsBotRunning())
  }

  @objc func startBot(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?

    CoreStartBot(&err)
    if let error = err {
      logger.format("start bot error: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(nil)
    }
  }

  @objc func stopBot(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?

    CoreStopBot(&err)
    if let error = err {
      logger.format("stop bot error: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(nil)
    }
  }

  @objc func getLocalGRPCInfos(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    resolve(CoreGetLocalGRPCInfos())
  }

  @objc func startLocalGRPC(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?

    CoreStartLocalGRPC(&err)
    if let error = err {
      logger.format("start local gRPC error: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(nil)
    }
  }

  @objc func stopLocalGRPC(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?

    CoreStopLocalGRPC(&err)
    if let error = err {
      logger.format("stop local gRPC error: ", level: .error, error.userInfo.description)
      reject("\(String(describing: error.code))", error.localizedDescription, error)
    } else {
      resolve(nil)
    }
  }
}
