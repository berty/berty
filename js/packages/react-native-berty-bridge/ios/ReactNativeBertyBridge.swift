//
//  BertyBridge.swift
//  BertyBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

@objc(GoBertyDemo)
class GoBertyDemo: NSObject {
    var bridge: BertybridgeDemoBridgeProtocol?

    override init() {
        super.init()
    }

    @objc func start(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridge != nil {
                throw NSError(domain: "already started", code: 1)
            }

            var err: NSError?
            let opts = BertybridgeDemoOpts()
            opts.logLevel = "debug"
            let bridge = BertybridgeNewDemoBridge(opts, &err)
            if err != nil {
                throw err!
            }

            self.bridge = bridge
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func getGRPCAddr(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            guard let bridge = self.bridge else {
                throw NSError(domain: "bridge isn't started", code: 1)
            }

            let addr = bridge.grpcWebSocketListenerAddr()
            resolve(addr)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
}
