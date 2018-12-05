//
//  BertyPeripheralManagerDelegate.h
//  ble
//
//  Created by sacha on 28/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#ifndef BertyPeripheralManagerDelegate_h
#define BertyPeripheralManagerDelegate_h

#import "BertyUtils.h"
#import "BertyPeripheralDelegate.h"
#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

extern void sendBytesToConn(char *, void *, int);

@interface BertyPeripheralManagerDelegate: NSObject <CBPeripheralManagerDelegate>

@property (nonatomic, strong) BertyPeripheralDelegate *peripheralDelegate;

- (instancetype)initWithPeripheralDelegate:(BertyPeripheralDelegate *)delegate;

@end

#endif
