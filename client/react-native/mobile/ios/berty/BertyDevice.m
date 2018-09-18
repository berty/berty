//
//  BertyDevice.m
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyDevice.h"

#import <React/RCTLog.h>

@implementation BertyDevice

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral {
  self = [super init];
  self.peripheral = peripheral;
  self.data = [[NSMutableData alloc]init];
  self.counter = 0;
  RCTLogInfo(@"testttttttttttttttttttttttt");
  return self;
}

- (void)inc {
  RCTLogInfo(@"ci 123 %d", self.counter);
  self.counter++;
  RCTLogInfo(@"ci 123 %d", self.counter);
}

@end
