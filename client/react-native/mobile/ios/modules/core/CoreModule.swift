//
//  File.swift
//  berty
//
//  Created by Godefroy Ponsinet on 29/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation

@objc(CoreModule)
class CoreModule: NSObject {
  @objc func start(_ resolve: RCTPromiseResolveBlock!,  reject: RCTPromiseRejectBlock!) {
    var err: NSError?

    let filesDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
    if filesDir == nil {
      reject("\(String(describing: err?.code))", err?.userInfo.description, err)
    }
    
    let filesPath = filesDir?.path
    let fileExist = FileManager.default.fileExists(atPath: filesPath!)
    if fileExist == false {
      do {
        try FileManager.default.createDirectory(at: filesDir!, withIntermediateDirectories: true, attributes: nil)
      } catch {
        reject("\(String(describing: err?.code))", err?.userInfo.description, err)
      }
    }
    CoreStart(filesPath, &err)
    if err != nil {
      reject("\(String(describing: err?.code))", err?.userInfo.description, err)
    }
    resolve(nil)
  }
  
  @objc func getPort(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    var err: NSError?
    var port: Int = 0
    
    CoreGetPort(&port, &err)
    if err != nil {
      reject("\(String(describing: err?.code))", err?.userInfo.description, err)
    }
    resolve(port)
  }
}
