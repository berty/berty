//
//  BertyDevice.h
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#ifndef BertyDevice_h
#define BertyDevice_h

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

@interface BertyDevice : NSObject

@property (nonatomic, readwrite, strong) NSMutableData *data;
@property (nonatomic, readwrite, strong) CBPeripheral *peripheral;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral;

@end

#endif
