import UIKit
import Core
import PushKit

@UIApplicationMain
class AppDelegate: AppDelegateObjC {
  var logger = Logger("chat.berty.io", "AppDelegate")
  var launchOptions: [UIApplicationLaunchOptionsKey: Any]?

  override init() {
    super.init()
  }

  func getFilesDir() throws -> String {
    let filesDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
    let filesPath = filesDir?.path
    let fileExist = FileManager.default.fileExists(atPath: filesPath!)

    // do this in gomobile and set storage as global in gomobile
    if fileExist == false {
      try FileManager.default.createDirectory(at: filesDir!, withIntermediateDirectories: true, attributes: nil)
    }
    return filesPath!
  }

  func startReact() {
    let jsCodeLocation: URL =
      (RCTBundleURLProvider.sharedSettings()?.jsBundleURL(forBundleRoot: "index", fallbackResource: nil))!

    let rootView: RCTRootView = RCTRootView.init(
      bundleURL: jsCodeLocation,
      moduleName: "root",
      initialProperties: nil,
      launchOptions: self.launchOptions
    )
    rootView.backgroundColor = UIColor.init(red: 1.0, green: 1.0, blue: 1.0, alpha: 1)

    self.window = UIWindow.init(frame: UIScreen.main.bounds)
    let rootViewController: UIViewController = UIViewController()
    rootViewController.view = rootView
    self.window.rootViewController = rootViewController
    self.window.makeKeyAndVisible()
  }

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.launchOptions = launchOptions

    // TODO: Move this line to applicationDidBecomeActive when envelope db with network independant start will be implem
    self.startReact()
    // TODO: remote comment when independant start will be implem
    // Core.startNetwork()

    // permit to show local notification in background mode
    application.beginBackgroundTask(withName: "showNotification", expirationHandler: nil)

    // set the notification driver to core
    Core.notificationDriver()?.native = Notification()

    // activate pushkit if notification activated
    if application.isRegisteredForRemoteNotifications {
      do {
        try Core.notificationDriver()?.native?.register()
      } catch let err as NSError {
        logger.format(
          "cannot register for remote notification: %@",
          level: Level.error,
          err.userInfo.description
        )
      }
    }

    // set storage path
    do {
      try Core.deviceInfo()?.setStoragePath(try self.getFilesDir())
    } catch let error as NSError {
      logger.format("unable to set storage path: %@", level: .error, error.userInfo.description)
      return false
    }

    let deadlineTime = DispatchTime.now() + .seconds(10)

    DispatchQueue.global(qos: .background).asyncAfter(deadline: deadlineTime) {
      if let remoteNotifPayload = launchOptions?[UIApplicationLaunchOptionsKey.localNotification]
        as? UILocalNotification {
        if let data = remoteNotifPayload.userInfo as? [String: String] {
          if let url = data["url"] {
            if url.count > 0 {
              super.application(application, open: URL.init(string: url)!, options: [
                                 UIApplicationOpenURLOptionsKey.sourceApplication: Bundle.main.bundleIdentifier!,
                                UIApplicationOpenURLOptionsKey.openInPlace: false
                ])
            }
          }
        }
      }
    }

    return true
  }

  override func applicationDidBecomeActive(_ application: UIApplication) {
    // start react if app was killed
    if Core.deviceInfo()?.getAppState() == Core.deviceInfoAppStateKill() {
      // self.startReact()
    }

    do {
      try Core.deviceInfo()?.setAppState(Core.deviceInfoAppStateForeground())
    } catch let err as NSError {
      logger.format("application did become active: %@", level: .error, err.userInfo.description)
    }
  }

  override func applicationDidEnterBackground(_ application: UIApplication) {
    do {
      try Core.deviceInfo()?.setAppState(Core.deviceInfoAppStateBackground())
    } catch let err as NSError {
      logger.format("application did enter background: %@", level: .error, err.userInfo.description)
    }
  }
}
