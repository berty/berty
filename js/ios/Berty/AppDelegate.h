#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <Expo/Expo.h>

@interface AppDelegate : EXAppDelegateWrapper <UIApplicationDelegate, UNUserNotificationCenterDelegate, RCTBridgeDelegate>
@property (nonatomic, strong) UIWindow *window;

@end
