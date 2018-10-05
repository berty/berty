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
  self.isReady = NO;
  self.isSubscribe = NO;
  NSLog(@"%@ %@", self.peerID, self.ma);
  return self;
}

- (void)setIsSubscribe:(BOOL)v {
	_isSubscribe = v;
	if (self.ma != nil && self.peerID != nil) {
        self.isReady = YES;
    }
}

- (void)setPeerID:(NSString*)p {
    _peerID = p;
	NSLog(@"setpeer %@ %@", self.ma, p);
    if (self.ma != nil && self.isSubscribe == YES) {
        self.isReady = YES;
		NSLog(@"RDY");
    }
}

- (void)setMa:(NSString*)a {
    _ma = a;
	NSLog(@"setma %@ %@", self.peerID, a);
    if (self.peerID != nil && self.isSubscribe == YES) {
		NSLog(@"RDY");
        self.isReady = YES;
    }
}

@end
