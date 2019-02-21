//
//  BertyCentralManagerDelegate.h
//  ble
//
//  Created by sacha on 28/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "BertyPeripheralDelegate.h"

#ifndef BertyCentralManagerDelegate_h
#define BertyCentralManagerDelegate_h

//extern void setConnClosed(char *);

@interface BertyCentralManagerDelegate : NSObject <CBCentralManagerDelegate>

@property (nonatomic, strong) BertyPeripheralDelegate *peripheralDelegate;

- (instancetype)initWithPeripheralDelegate:(BertyPeripheralDelegate *)delegate;

@end

#endif
