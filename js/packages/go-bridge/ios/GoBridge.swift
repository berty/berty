//
//  GoBridge.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

@objc(GoBridge)
class GoBridge: NSObject {
    let orbitdir: URL

    var bridgeDemo: BertybridgeDemoBridgeProtocol?

    override init() {
        // set berty dir for persistance
        let absUserUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        self.orbitdir = absUserUrl.appendingPathComponent("orbitdb", isDirectory: true)

        super.init()
    }

    @objc func startDemo(_ opts: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeDemo != nil {
                throw NSError(domain: "already started", code: 1)
            }

            // get opts
            let optPersistance = opts["persistance"] as? Bool ?? false
            let optLog = opts["logLevel"] as? String ?? "info"

            var err: NSError?
            let opts = BertybridgeDemoOpts()

            // set log level
            opts.logLevel = optLog

            // set persistance if needed
            if optPersistance {
                var isDirectory: ObjCBool = true
                let exist = FileManager.default.fileExists(atPath: self.orbitdir.path, isDirectory: &isDirectory)
                if !exist {
                    try FileManager.default.createDirectory(atPath: self.orbitdir.path, withIntermediateDirectories: true, attributes: nil)
                }

                opts.orbitDBDirectory = self.orbitdir.path
            }

            let bridgeDemo = BertybridgeNewDemoBridge(opts, &err)
            if err != nil {
                throw err!
            }

            self.bridgeDemo = bridgeDemo
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func getDemoAddr(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            guard let bridgeDemo = self.bridgeDemo else {
                throw NSError(domain: "bridgeDemo isn't started", code: 1)
            }

            let addr = bridgeDemo.grpcWebSocketListenerAddr()
            resolve(addr)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
}
