//
//  BertyCentralManagerDelegate.h
//  ble
//
//  Created by sacha on 28/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#ifndef BertyCentralManagerDelegate_h
#define BertyCentralManagerDelegate_h

#import "BertyUtils.h"
#import "BertyPeripheralDelegate.h"
#import "BertyDevice.h"
#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

extern void setConnClosed(char *);

@interface BertyCentralManagerDelegate : NSObject <CBCentralManagerDelegate>

@property (nonatomic, strong) BertyPeripheralDelegate *peripheralDelegate;

- (instancetype)initWithPeripheralDelegate:(BertyPeripheralDelegate *)delegate;

@end

#endif
