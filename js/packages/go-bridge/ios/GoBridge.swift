//
//  GoBridge.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge
import ZIPFoundation

@objc(GoBridge)
class GoBridge: NSObject {
    // protocol
    var bridgeProtocol: BertybridgeProtocol?
    let rootdir: URL

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        // set berty dir for persistance
        let absUserUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        self.rootdir = absUserUrl.appendingPathComponent("berty", isDirectory: true)

        super.init()
    }

    @objc func clearStorage(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            let rootExists = FileManager.default.fileExists(atPath: self.rootdir.path)
            if rootExists {
                try FileManager.default.removeItem(atPath: self.rootdir.path)
            }
            resolve(true)
        }
        catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    //////////////
    // Protocol //
    //////////////

    @objc func startProtocol(_ opts: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            if self.bridgeProtocol != nil {
                throw NSError(domain: "already started", code: 1)
            }

            // get opts
            let optTracing = opts["tracing"] as? Bool ?? false
            let optPersistance = opts["persistance"] as? Bool ?? false
            let optLog = opts["logLevel"] as? String ?? "info"
            let optGrpcListeners = opts["grpcListeners"] as? NSArray ?? ["/ip4/127.0.0.1/tcp/0/grpcws"]
            let optSwarmListeners = opts["swarmListeners"] as? NSArray ?? ["/ip4/0.0.0.0/tcp/0", "/ip6/0.0.0.0/tcp/0"]

            var err: NSError?
            guard let config = BertybridgeNewProtocolConfig() else {
                throw NSError(domain: "unable to create config", code: 1)
            }

            // init logger
            let logger = LoggerDriver("tech.berty", "protocol")

            config.logLevel(optLog)
            config.loggerDriver(logger)

            // configure grpc listener
            for obj in optGrpcListeners {
                guard let listener = obj as? String else {
                    throw NSError(domain: "unable to get listener", code: 1)
                }

                config.addGRPCListener(listener)
            }

            // configure swarm listeners
            for obj in optSwarmListeners {
                guard let listener = obj as? String else {
                    throw NSError(domain: "unable to get listener", code: 1)
                }

                config.addSwarmListener(listener)
            }

            // set persistance if needed
            if optPersistance {
                var isDirectory: ObjCBool = true
                let exist = FileManager.default.fileExists(atPath: self.rootdir.path, isDirectory: &isDirectory)
                if !exist {
                    try FileManager.default.createDirectory(atPath: self.rootdir.path, withIntermediateDirectories: true, attributes: nil)
                }

                NSLog("root dir: `%@`", self.rootdir.path)
                config.rootDirectory(self.rootdir.path)
            }
           
            // extract the ipfs webui blocks
            let ipfsWebuiPath = Bundle.main.path(forResource: "ipfs_webui", ofType: "zip")
            var sourceURL = URL(fileURLWithPath: ipfsWebuiPath!)
            var destinationURL = URL(fileURLWithPath: self.rootdir.path)
            destinationURL.appendPathComponent("ipfs")
            NSLog("Unzip destination %@", destinationURL.absoluteString)
            do {
                try FileManager.default.createDirectory(at: destinationURL, withIntermediateDirectories: true, attributes: nil)
                try FileManager.default.unzipItem(at: sourceURL, to: destinationURL)
            } catch {
                print("Extraction of ZIP archive failed with error:\(error)")
            }

            if optTracing {
                config.enableTracing()
                config.setTracingPrefix("changeme")
            }

            let bridgeProtocol = BertybridgeNewProtocolBridge(config, &err)
            if err != nil {
                throw err!
            }

            self.bridgeProtocol = bridgeProtocol

            resolve(true)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }

    @objc func stopProtocol(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      do {
          if self.bridgeProtocol != nil {
              try self.bridgeProtocol?.close()
              self.bridgeProtocol = nil
          }
          resolve(true)
      } catch let error as NSError {
          reject("\(String(describing: error.code))", error.userInfo.description, error)
      }
    }

    @objc func getProtocolAddr(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        do {
            guard let bridgeProtocol = self.bridgeProtocol else {
                throw NSError(domain: "bridgeProtocol isn't started", code: 1)
            }

            let addr = bridgeProtocol.grpcWebSocketListenerAddr()
            resolve(addr)
        } catch let error as NSError {
            reject("\(String(describing: error.code))", error.userInfo.description, error)
        }
    }
}
