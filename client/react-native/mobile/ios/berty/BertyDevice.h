//
//  BertyDevice.h
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

NS_ASSUME_NONNULL_BEGIN

@interface BertyDevice : NSObject

@property (nonatomic, readwrite, strong) NSMutableData *data;
@property (atomic, readwrite, assign) int counter;
@property (nonatomic, readwrite, strong) CBPeripheral *peripheral;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral;

@end

NS_ASSUME_NONNULL_END
