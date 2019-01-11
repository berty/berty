/**
* Copyright (c) 2015-present, Facebook, Inc.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

#import "AppDelegate.h"
#import "Berty-Bridging-Header.h"

@implementation AppDelegateObjC

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
    return [RCTLinkingManager application:application
                    continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

    NSURL *jsCodeLocation;

    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

    RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                    moduleName:@"root"
                                                    initialProperties:nil
                                                    launchOptions:launchOptions];
    rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    // permit to show local notifications in background mode
    [application beginBackgroundTaskWithName:@"showNotification" expirationHandler: nil];
    return YES;
}


// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
    if (notification.userInfo[@"url"] != nil && [(NSString *)notification.userInfo[@"url"] length]) {
      [self application:application openURL:[NSURL URLWithString:notification.userInfo[@"url"]] options:@{
                                    UIApplicationOpenURLOptionsSourceApplicationKey: [[NSBundle mainBundle] bundleIdentifier],
                                    UIApplicationOpenURLOptionsOpenInPlaceKey: @NO,
                             }];
    }
    [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

@end
