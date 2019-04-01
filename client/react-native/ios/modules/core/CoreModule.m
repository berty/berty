//
//  CoreModule.m
//  berty
//
//  Created by Godefroy Ponsinet on 29/08/2018.
//  Copyright © 2018 Berty Technologies. All rights reserved.
//

#import "React/RCTBridge.h"

// TEMPORARY FIX UNTIL https://github.com/facebook/react-native/pull/24155 is merged in react-native

#define RCT_EXPORT_MODULE_NO_LOAD(js_name, objc_name) \
RCT_EXTERN void RCTRegisterModule(Class); \
+ (NSString *)moduleName { return @#js_name; } \
__attribute__((constructor)) \
static void RCT_CONCAT(initialize_, objc_name)() { RCTRegisterModule([objc_name class]); }

#define RCT_EXTERN_REMAP_MODULE_2(js_name, objc_name, objc_supername) \
objc_name : objc_supername \
@end \
@interface objc_name (RCTExternModule) <RCTBridgeModule> \
@end \
@implementation objc_name (RCTExternModule) \
RCT_EXPORT_MODULE_NO_LOAD(js_name, objc_name)

@interface RCT_EXTERN_REMAP_MODULE_2(CoreModule, CoreModule, NSObject)

RCT_EXTERN_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(listAccounts:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(start:(NSString)nickname
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(restart:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(panic:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXPORT_METHOD(throwException)
{
    @throw [NSException exceptionWithName:@"throw exception" reason:@"throw native exception" userInfo:nil];
}

RCT_EXTERN_METHOD(dropDatabase:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getPort:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getNetworkConfig:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(updateNetworkConfig:(NSString *)config
                    resolve:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(isBotRunning:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(startBot:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(stopBot:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getLocalGRPCInfos:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(startLocalGRPC:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(stopLocalGRPC:(RCTPromiseResolveBlock)resolve
                    reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(setCurrentRoute:(NSString)route);

RCT_EXTERN_METHOD(getNotificationStatus:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(openSettings:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
