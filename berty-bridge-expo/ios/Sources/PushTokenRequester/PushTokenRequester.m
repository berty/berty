//
//  PushTokenRequester.m
//  Berty
//
//  Created by Antoine Eddi on 01/09/2021.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PushTokenRequester, NSObject)

RCT_EXTERN_METHOD(request:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
