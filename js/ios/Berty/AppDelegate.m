#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// Custom imports
#import <React/RCTLinkingManager.h> // needed for deep linking
#import "Berty-Swift.h" // needed for swift
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

#import <Firebase.h> // needed for crashlytics, TODO: remove this after closed beta / replace it by a more privacy complient solution
#import "RNBootSplash.h" // needed by react-native-bootsplash
// Done custom imports

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Berty"
                                            initialProperties:nil];

  // TODO: remove crashlytics after closed beta / replace it by a more privacy complient solution
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  // Background Fetch
  if (@available(iOS 13.0, *)) {
    [[LifeCycle getSharedInstance] registerBackgroundTaskWithIdentifier:@"tech.berty.ios.task.gobridge-process"];
    [[LifeCycle getSharedInstance] registerBackgroundTaskWithIdentifier:@"tech.berty.ios.task.gobridge-refresh"];
  } else {
    [application setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
  }

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView]; // needed by react-native-bootsplash

  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}


- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Custom lifecycle handlers

- (void)application:(UIApplication *)application performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [[LifeCycle getSharedInstance] startBackgroundTaskWithCancelAfter:25.0 completionHandler:completionHandler];
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
  if (@available(iOS 13.0, *)) {
    [[LifeCycle getSharedInstance] scheduleBackgroundProcessingWithIdentifier:@"tech.berty.ios.task.gobridge-process"];
    [[LifeCycle getSharedInstance] scheduleAppRefreshWithIdentifier:@"tech.berty.ios.task.gobridge-refresh"];
  }
  [[LifeCycle getSharedInstance] updateStateWithState:UIApplicationStateBackground];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  [[LifeCycle getSharedInstance] updateStateWithState:UIApplicationStateActive];
}

- (void)applicationWillResignActive:(UIApplication *)application
{
  [[LifeCycle getSharedInstance] updateStateWithState:UIApplicationStateInactive];
}

- (void)applicationWillTerminate:(UIApplication *)application
{
  [[LifeCycle getSharedInstance] willTerminate];
}

// needed for deep linking on iOS 9.x or newer
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

/*
//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}
*/
@end
