//
//  BertyBluetoothModule.h
//  bluetooth
//
//  Created by sacha on 04/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#import "BertyCentralManager.h"

NS_ASSUME_NONNULL_BEGIN

@interface BertyBluetoothModule : RCTEventEmitter <RCTBridgeModule>

@property(nonatomic, strong) BertyCentralManager* bcm;

@end

NS_ASSUME_NONNULL_END
