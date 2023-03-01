//
//  AddressBook.m
//  Berty
//
//  Created by Guillaume Louvigny on 23/02/2023.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AddressBook, NSObject)

RCT_EXTERN_METHOD(getAllContacts:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getDeviceCountry:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
