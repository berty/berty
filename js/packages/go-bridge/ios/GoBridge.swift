//
//  GoBridge.swift
//  GoBridge
//
//  Created by Guilhem Fanton on 06/01/2020.
//  Copyright © 2020 Berty Technologies. All rights reserved.
//

import Foundation
import Bertybridge

extension NSDictionary {
    func get(bool: String, defaultValue: Bool = false) -> Bool { return self[bool] as? Bool ?? defaultValue }
    func get(string: String, defaultValue: String = "") -> String { return self[string] as? String ?? defaultValue }
    func get(int: String, defaultValue: Int = 0) -> Int { return self[int] as? Int ?? defaultValue }
    func get(array: String, defaultValue: NSArray = []) -> NSArray { return self[array] as? NSArray ?? defaultValue }
    func get(object: NSDictionary, defaultValue: NSDictionary = [:]) -> NSDictionary { return self[object] as? NSDictionary ?? defaultValue }
}

@objc(GoBridge)
class GoBridge: NSObject {
    static let rnlogger = LoggerDriver("tech.berty", "react")

    // protocol
    var bridgeProtocol: BertybridgeProtocol?
    let rootdir: URL

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        // set berty dir for persistence
        let absUserUrl = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        self.rootdir = absUserUrl.appendingPathComponent("berty", isDirectory: true)

        super.init()
    }

    deinit {
      do {
        if self.bridgeProtocol != nil {
            NSLog("bflifecycle: calling try self.bridgeProtocol?.close()")
            try self.bridgeProtocol?.close()
            NSLog("bflifecycle: done try self.bridgeProtocol?.close()")
            self.bridgeProtocol = nil
        }
      } catch let error as NSError {
        NSLog("\(String(describing: error.code))")
      }
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

    @objc func log(_ opts: NSDictionary) {
        if let message = opts["message"] as? String {
            let type = opts["level"] as? String ?? "info"

            // set log level
            let level = Level(rawValue: type.uppercased()) ?? Level.info

            // log
            GoBridge.rnlogger.print(message as NSString, level: level, category: "react-native")
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

            // gather opts
            let optPersistence = opts.get(bool: "persistence")
            let optLog = opts.get(string: "logLevel", defaultValue: "info")
            let optPOIDebug = opts.get(bool: "poiDebug")
            let optGrpcListeners = opts.get(array: "grpcListeners", defaultValue: ["/ip4/127.0.0.1/tcp/0/grpcws"])
            let optSwarmListeners = opts.get(array: "swarmListeners", defaultValue: ["/ip4/0.0.0.0/tcp/0", "/ip6/0.0.0.0/tcp/0"])
            let optTracing = opts.get(bool: "tracing")
            let optTracingPrefix = opts.get(string: "tracingPrefix")
            let optLocalDiscovery = opts.get(bool: "localDiscovery")

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

            // set persistence if needed
            if optPersistence {
                var isDirectory: ObjCBool = true
                let exist = FileManager.default.fileExists(atPath: self.rootdir.path, isDirectory: &isDirectory)
                if !exist {
                    try FileManager.default.createDirectory(atPath: self.rootdir.path, withIntermediateDirectories: true, attributes: nil)
                }

                NSLog("root dir: `%@`", self.rootdir.path)
                config.rootDirectory(self.rootdir.path)
            }

            if optPOIDebug {
                config.enablePOIDebug()
            }

            if optTracing {
                config.enableTracing()
                config.setTracingPrefix(optTracingPrefix)
            }

            if !optLocalDiscovery {
                config.disableLocalDiscovery()
            }

            NSLog("bflifecycle: calling BertybridgeNewProtocolBridge")
            let bridgeProtocol = BertybridgeNewProtocolBridge(config, &err)
            NSLog("bflifecycle: done BertybridgeNewProtocolBridge")
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
                NSLog("bflifecycle: calling try self.bridgeProtocol?.close()")
                try self.bridgeProtocol?.close()
                NSLog("bflifecycle: done try self.bridgeProtocol?.close()")
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
