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
    @objc func start(_ resolve: RCTPromiseResolveBlock!,  reject: RCTPromiseRejectBlock!) {
        var err: NSError?

        let filesDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
        let filesPath = filesDir?.path
        let fileExist = FileManager.default.fileExists(atPath: filesPath!)

        if fileExist == false {
            do {
                try FileManager.default.createDirectory(at: filesDir!, withIntermediateDirectories: true, attributes: nil)
            } catch let error as NSError {
                logger.format("create directory error: ", level: .Error, error.userInfo.description)
                reject("\(String(describing: error.code))", error.userInfo.description, error)
            }
        }

        CoreStart(filesPath, logger, &err)
        if let error = err {
            logger.format("core module init error: %@", level: .Error, error.userInfo.description)
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
        resolve(nil)
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
}
