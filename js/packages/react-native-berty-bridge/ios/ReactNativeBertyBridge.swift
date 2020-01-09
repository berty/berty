//
//  BertyBridge.swift
//  BertyBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

@objc(ReactNativeBertyBridge)
class ReactNativeBertyBridge: NSObject {
    var bridgeDemo: BertybridgeDemoBridgeProtocol?

    override init() {
        super.init()
    }

    @objc func startDemo(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeDemo != nil {
                throw NSError(domain: "already started", code: 1)
            }

            var err: NSError?
            let opts = BertybridgeDemoOpts()
            opts.logLevel = "debug"
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
