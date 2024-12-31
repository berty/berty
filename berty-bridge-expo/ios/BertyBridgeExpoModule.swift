import ExpoModulesCore
import Bertybridge

public class BertyBridgeExpoModule: Module {
    let logger = BertyLogger("tech.berty.react")

    // protocol
    var bridgeMessenger: BertybridgeBridge?
    var remoteBridge: BertybridgeRemoteBridge?
    var serviceClient: BertybridgeServiceClientProtocol?
    var connectivityDriver = ConnectivityDriver()
    var appRootDir: String?
    var sharedRootDir: String?
    var debug: Bool?
    
    enum logLevel: String, Enumerable {
        case debug
        case info
        case warn
        case error
    }
    
    struct logOpts: Record {
        @Field
        var level: logLevel?
        
        @Field
        var message: String?
    }
    
  public func definition() -> ModuleDefinition {
    Name("BertyBridgeExpo")

    OnCreate {
      // set berty dir for persistence
      self.sharedRootDir = try! RootDirGet()

      let docDir = try! FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      self.appRootDir = docDir.appendingPathComponent("berty", isDirectory: true).path
        
#if DEBUG_LOGS
      debug = true;
#else
      debug = false;
#endif
    }
      
    OnDestroy {
      do {
          if self.bridgeMessenger != nil {
              try self.bridgeMessenger?.close()
              self.bridgeMessenger = nil
          }
          if self.remoteBridge != nil {
              try self.remoteBridge?.close()
              self.remoteBridge = nil
          }
          self.serviceClient = nil
      } catch let error as NSError {
          self.logger.error("\(String(describing: error.code))")
      }
    }
    
    Constants([
        "debug": self.debug
    ])
      
    AsyncFunction("initBridge") { (promise: Promise) in
        do {
            if self.bridgeMessenger != nil || self.remoteBridge != nil || self.serviceClient != nil {
                throw NSError(domain: "tech.berty.gobridge", code: 1, userInfo: [NSLocalizedDescriptionKey : "already started"])
            }

            var err: NSError?
            guard let config = BertybridgeNewBridgeConfig() else {
                throw NSError(domain: "tech.berty.gobridge", code: 2, userInfo: [NSLocalizedDescriptionKey : "unable to create config"])
            }

            // get user preferred languages
            let preferredLanguages: String = Locale.preferredLanguages.joined(separator: ",")

            config.setLifeCycleDriver(LifeCycleDriver.shared)
            config.setNotificationDriver(NotificationDriver.shared)
            config.setKeystoreDriver(KeystoreDriver.shared)
            config.setPreferredLanguages(preferredLanguages)

            // @TODO(gfanton): make this dir in golang
            var isDirectory: ObjCBool = true
            var exist = FileManager.default.fileExists(atPath: self.sharedRootDir!, isDirectory: &isDirectory)
            if !exist {
                try FileManager.default.createDirectory(atPath: self.sharedRootDir!, withIntermediateDirectories: true, attributes: nil)
            }
          
            exist = FileManager.default.fileExists(atPath: self.appRootDir!, isDirectory: &isDirectory)
            if !exist {
                try FileManager.default.createDirectory(atPath: self.appRootDir!, withIntermediateDirectories: true, attributes: nil)
            }

            // Disable iOS backup
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
          
            var appRootDirURL = URL(fileURLWithPath: self.appRootDir!)
            try appRootDirURL.setResourceValues(values)

            var sharedRootDirURL = URL(fileURLWithPath: self.sharedRootDir!)
            try sharedRootDirURL.setResourceValues(values)

            // Set root directories
            config.setAppRootDir(self.appRootDir)
            config.setSharedRootDir(self.sharedRootDir)

            config.setConnectivityDriver(self.connectivityDriver);

            let bridgeMessenger = BertybridgeNewBridge(config, &err)
            if err != nil {
                throw err!
            }

            self.bridgeMessenger = bridgeMessenger
            self.serviceClient = bridgeMessenger // bridgeMessenger implements ServiceClient interface

            BertyLogger.useBridge(self.bridgeMessenger)

            promise.resolve(true)
        } catch let error as NSError {
            promise.reject(error)
        }
    }

      AsyncFunction("initBridgeRemote") { (address: String, promise: Promise) in
          do {
              if self.remoteBridge != nil || self.bridgeMessenger != nil || self.serviceClient != nil {
                  throw NSError(domain: "tech.berty.gobridge", code: 1, userInfo: [NSLocalizedDescriptionKey : "already started"])
              }

              var err: NSError?
              guard let config = BertybridgeNewRemoteBridgeConfig() else {
                  throw NSError(domain: "tech.berty.gobridge", code: 2, userInfo: [NSLocalizedDescriptionKey : "unable to create config"])
              }

              // Disable iOS backup
              var values = URLResourceValues()
              values.isExcludedFromBackup = true

              let remoteBridge = BertybridgeNewRemoteBridge(address, config, &err)
              if err != nil {
                  throw err!
              }

              self.remoteBridge = remoteBridge
              self.serviceClient = remoteBridge // remoteBridge implements ServiceClient interface

              promise.resolve(true)
          } catch let error as NSError {
              promise.reject(error)
          }
      }

      AsyncFunction("connectService") { (serviceName: String, address: String, promise: Promise) in
          do {
              guard let remoteBridge = self.remoteBridge else {
                  throw NSError(domain: "tech.berty.gobridge", code: 4, userInfo: [NSLocalizedDescriptionKey : "remoteBridge isn't started"])
              }
              try remoteBridge.connectService(serviceName, address: address)
              promise.resolve(true)
          } catch let error as NSError {
              promise.reject(error)
          }
      }

      AsyncFunction("closeBridge") { (promise: Promise) in
            do {
                if self.bridgeMessenger != nil {
                    try self.bridgeMessenger?.close()
                    self.bridgeMessenger = nil
                }
                if self.remoteBridge != nil {
                    try self.remoteBridge?.close()
                    self.remoteBridge = nil
                }
                self.serviceClient = nil
                promise.resolve(true)
            } catch let error as NSError {
                promise.reject(error)
            }
        }

      AsyncFunction("invokeBridgeMethod") { (method: String, b64message: String, promise: Promise) in
            do {
                guard let serviceClient = self.serviceClient else {
                    throw NSError(domain: "tech.berty.gobridge", code: 3, userInfo: [NSLocalizedDescriptionKey : "serviceClient isn't started"])
                }

                let promise = PromiseBlock(promise)
                serviceClient.invokeBridgeMethod(with: promise, method: method, b64message: b64message)
            } catch let error as NSError {
                promise.reject(error)
            }
        }

      AsyncFunction("getProtocolAddr") { (promise: Promise) in
            do {
                if self.bridgeMessenger == nil {
                    throw NSError(domain: "tech.berty.gobridge", code: 4, userInfo: [NSLocalizedDescriptionKey : "bridgeMessenger isn't started"])
                }

                let addr: [String] = []
                promise.resolve(addr)
            } catch let error as NSError {
                promise.reject(error)
            }
        }
      
      AsyncFunction("clearStorage") { (promise: Promise) in
          do {
              if FileManager.default.fileExists(atPath: self.appRootDir!) {
                  try FileManager.default.removeItem(atPath: self.appRootDir!)
              }
              if FileManager.default.fileExists(atPath: self.sharedRootDir!) {
                  try FileManager.default.removeItem(atPath: self.sharedRootDir!)
              }
              promise.resolve(true)
          }
          catch let error as NSError {
              promise.reject(error)
          }
      }

      Function("log") { (opts: logOpts) in
          #if !CFG_APPSTORE
          if let message = opts.message {
              let level = opts.level ?? logLevel.info

              self.logger.log(BertyLogger.LogLevel(rawValue: level.rawValue.uppercased()) ?? .INFO, message)
          }
          #endif
      }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(BertyBridgeExpoView.self) {
      // Defines a setter for the `name` prop.
      Prop("name") { (view: BertyBridgeExpoView, prop: String) in
        print(prop)
      }
    }
  }
}
