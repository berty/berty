//
//  BertyDevice.m
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyDevice.h"

@implementation BertyDevice

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral {
  self = [super init];
  self.peripheral = peripheral;
  self.data = [[NSMutableData alloc]init];
  return self;
}

@end
