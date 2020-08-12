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

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"Berty"
                                            initialProperties:nil];

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
    // [[LifeCycle getSharedInstance] scheduleBackgroundProcessingWithIdentifier:@"tech.berty.ios.task.gobridge-process"];
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
