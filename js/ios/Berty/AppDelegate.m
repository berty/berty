#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// Custom imports
#import <React/RCTLinkingManager.h> // needed for deep linking
#import "Berty-Swift.h" // needed for swift
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

  // Set deepLink in right launchOptions key if opened from push notif
  if (launchOptions != nil && launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey] != nil) {
    NSString *deepLink = launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey][@"deepLink"];
    if (deepLink != nil) {
      NSMutableDictionary *editedLaunchOptions = [launchOptions mutableCopy];
      [editedLaunchOptions setObject:[NSURL URLWithString: deepLink] forKey:UIApplicationLaunchOptionsURLKey];
      [editedLaunchOptions removeObjectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
      launchOptions = [editedLaunchOptions copy];
    }
  }

RCTBridge *bridge = [self.reactDelegate createBridgeWithDelegate:self launchOptions:launchOptions];
RCTRootView *rootView = [self.reactDelegate createRootViewWithBridge:bridge
                                            moduleName:@"Berty"
                                            initialProperties:nil];

  // Sync languages settings with app extension
  id languages = [[NSUserDefaults standardUserDefaults] objectForKey:@"AppleLanguages"];
  NSUserDefaults *commonUserDefaults = [Common objcUserDefaults];
  if (commonUserDefaults != nil) {
    [commonUserDefaults setObject:languages forKey:@"AppleLanguages"];
  } else {
    NSLog(@"error: language sync with app extension failed");
  }

  // Background Fetch
  if (@available(iOS 13.0, *)) {
    // [LocalNotificationManager requestPermission];
    [[LifeCycle getSharedInstance] registerBackgroundTaskWithIdentifier:@"tech.berty.ios.task.gobridge-process"];
    [[LifeCycle getSharedInstance] registerBackgroundTaskWithIdentifier:@"tech.berty.ios.task.gobridge-refresh"];
  } else {
    [application setMinimumBackgroundFetchInterval:UIApplicationBackgroundFetchIntervalMinimum];
  }

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [self.reactDelegate createRootViewController];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [super application:application didFinishLaunchingWithOptions:launchOptions];

  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView]; // needed by react-native-bootsplash

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

// Callbacks for APNS token request
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [PushTokenRequester.shared onRequestSucceeded:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [PushTokenRequester.shared onRequestFailed:error];
}

// Called when push notification was received in foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  NSString *payload = notification.request.content.userInfo[BertybridgeServicePushPayloadKey];

  if (payload != nil) {
    EventEmitter *eventEmitter = EventEmitter.shared;
    if (eventEmitter != nil) {
      // Send the payload to JS
      [eventEmitter sendEventWithName:@"onPushReceived" body:payload];
    }
  }

  // Ignore push notif from here, JS will decide to display it or not
  completionHandler(UNNotificationPresentationOptionNone);
}

// Called when a push notification is clicked on
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
  // If a deepLink exists in push notification, open it
  if (response.notification.request.content.userInfo != nil) {
    NSString *deepLink = response.notification.request.content.userInfo[@"deepLink"];
    if (deepLink != nil) {
      [[UIApplication sharedApplication] openURL:[NSURL URLWithString: deepLink] options:@{} completionHandler:^(BOOL success) {
        completionHandler();
      }];
      return;
    }
  }
  completionHandler();
}

@end
