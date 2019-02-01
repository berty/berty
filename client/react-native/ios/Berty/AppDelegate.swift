import UIKit
import Core
import PushKit

@UIApplicationMain
class AppDelegate: AppDelegateObjC {
  var logger = Logger("chat.berty.io", "AppDelegate")

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

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let jsCodeLocation: URL =
      (RCTBundleURLProvider.sharedSettings()?.jsBundleURL(forBundleRoot: "index", fallbackResource: nil))!

    let rootView: RCTRootView = RCTRootView.init(
      bundleURL: jsCodeLocation,
      moduleName: "root",
      initialProperties: nil,
      launchOptions: launchOptions
    )
    rootView.backgroundColor = UIColor.init(red: 1.0, green: 1.0, blue: 1.0, alpha: 1)

    self.window = UIWindow.init(frame: UIScreen.main.bounds)
    let rootViewController: UIViewController = UIViewController()
    rootViewController.view = rootView
    self.window.rootViewController = rootViewController
    self.window.makeKeyAndVisible()

    // permit to show local notification in background mode
    application.beginBackgroundTask(withName: "showNotification", expirationHandler: nil)

    // set the notification driver to core
    Core.notificationDriver()?.native = Notification()

    // activate pushkit if notification activated
    if application.isRegisteredForRemoteNotifications {
      do {
        try Core.notificationDriver().native.register()
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
      try Core.deviceInfo().setStoragePath(try self.getFilesDir())
    } catch let error as NSError {
      logger.format("unable to set storage path", level: .error, error.userInfo.description)
      return false
    }
    return true
  }
}
