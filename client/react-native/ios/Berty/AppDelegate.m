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

- (BOOL) application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^ _Nonnull __strong)(NSArray<id<UIUserActivityRestoring>> * _Nullable __strong))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
    [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

@end
