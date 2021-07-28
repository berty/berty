//
//  GoBridge.m
//  Berty
//
//  Created by Antoine Eddi on 09/08/2021.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GoBridge, NSObject)

RCT_EXTERN_METHOD(clearStorage:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(initBridge:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(log:(NSDictionary)opts);

RCT_EXTERN_METHOD(closeBridge:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(invokeBridgeMethod:(NSString)method
                  b64message:(NSString)b64message
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getProtocolAddr:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

+ (BOOL)requiresMainQueueSetup
{
 return YES;  // only do this if your module initialization relies on calling UIKit!
}

@end
