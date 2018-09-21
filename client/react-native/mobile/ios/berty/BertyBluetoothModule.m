//
//  BertyBluetoothModule.m
//  bluetooth
//
//  Created by sacha on 04/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyBluetoothModule.h"

@implementation BertyBluetoothModule

RCT_EXPORT_MODULE();

- (instancetype)init {
  self = [super init];
  if (self) {
    self.bcm = [[BertyCentralManager alloc] initWithSender:self];
  }
  return self;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"NEW_DEVICE", @"NEW_MESSAGE"];
}

RCT_EXPORT_METHOD(updateValue)
{
  [self.bcm updateValue];
}

RCT_EXPORT_METHOD(startDiscover)
{
  [self.bcm discover];
}

RCT_EXPORT_METHOD(subscribe)
{
  [self.bcm subscribe];
}

RCT_EXPORT_METHOD(connect:(NSString *)addr)
{
  [self.bcm connect:addr];
}

RCT_EXPORT_METHOD(writeTo:(NSString *)addr msg:(NSString *)msg)
{
  [self.bcm writeTo:addr msg:msg];
}

@end
