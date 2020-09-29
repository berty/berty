/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>
#import "Berty-Swift.h"

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

// TODO: remove this after closed beta / replace it by a more privacy complient solution
@import Firebase;

@implementation AppDelegate

/// REMPLACE ICI
// iOS 9.x or newer
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
////

//// AJOUTE CA
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
///////

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Berty"
                                            initialProperties:nil];

  // TODO: remove this after closed beta / replace it by a more privacy complient solution
  [FIRApp configure];

  // Background Fetch
  if (@available(iOS 13.0, *)) {
    [LocalNotificationManager requestPermission];
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

  return YES;
}

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

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
