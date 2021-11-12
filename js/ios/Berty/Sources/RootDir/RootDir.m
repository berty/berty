//
//  RootDir.m
//  Berty
//
//  Created by Antoine Eddi on 09/08/2021.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RootDir, NSObject)

RCT_EXTERN_METHOD(get:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
