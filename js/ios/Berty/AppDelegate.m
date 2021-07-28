#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// Custom imports
#import <React/RCTLinkingManager.h> // needed for deep linking
#import "Berty-Swift.h" // needed for swift
#import <Firebase.h> // needed for crashlytics, TODO: remove this after closed beta / replace it by a more privacy compliant solution
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

  // TODO: remove crashlytics after closed beta / replace it by a more privacy compliant solution
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  // Background Fetch
  if (@available(iOS 13.0, *)) {
    // [LocalNotificationManager requestPermission];
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

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  NSLog(@"LAUNCHED");
  if (launchOptions != nil) {
    NSLog(@"LAUNCHED WITH OPTIONS");
    NSDictionary* dictionary = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    if (dictionary != nil) {
      NSLog(@"LAUNCHED WITH DICT");
      for (int i = 0; i < dictionary.allKeys.count; i++) {
        NSLog(@"LAUNCHED WITH KEY: %@; VALUE: %@", dictionary.allKeys[i], dictionary.allValues[i]);
      }
    }
  }

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

// Callbacks for APNS token request
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [[PushNotificationDriver getSharedInstance] onRequestSucceeded:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [[PushNotificationDriver getSharedInstance] onRequestFailed:error];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  NSString *data = notification.request.content.userInfo[@"data"];
  
  if (data != nil) {
    // laVie(data)
  }
  NSLog(@"TOTODEBUG willPresentNotification");
  completionHandler(UNNotificationPresentationOptionNone);
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
  // TODO: handle notification response
  NSLog(@"TOTODEBUG RESPONSE");
  for (int i = 0; i < response.notification.request.content.userInfo.allKeys.count; i++) {
    NSLog(@"TOTODEBUG RESPONSE WITH KEY: %@; VALUE: %@ -\nLOL", response.notification.request.content.userInfo.allKeys[i], response.notification.request.content.userInfo.allValues[i]);
  }
  completionHandler();
}

@end
