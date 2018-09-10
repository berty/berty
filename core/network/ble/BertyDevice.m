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
  self.toSend = [[NSMutableArray alloc]init];
  self.isReady = NO;
  self.isSubscribe = NO;
  self.isWaiting = NO;
  self.isRdy = dispatch_semaphore_create(0);
  self.acceptSema = dispatch_semaphore_create(0);
  self.maSema = dispatch_semaphore_create(0);
  self.peerIDSema = dispatch_semaphore_create(0);
  self.readerSema = dispatch_semaphore_create(0);
  NSLog(@"INIT PERIPHERAL %@", [peripheral.identifier UUIDString]);
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [self waitDeviceRdy];
  });
  return self;
}

- (CBCharacteristic *)getWriter {
  for (CBService *service in self.peripheral.services) {
    if ([[service.UUID UUIDString] isEqual:@"A06C6AB8-886F-4D56-82FC-2CF8610D6663"]) {
      for (CBCharacteristic *charact in service.characteristics) {
        if ([[charact.UUID UUIDString] isEqual:@"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C"]) {
          return charact;
        }
      }
    }
  }
  return nil;
}

- (void)PrintWriteStack {
  NSLog(@"\e[1;31mStart stack\e[m");
  @synchronized (self.toSend) {
    for (NSData *data in self.toSend) {
      NSLog(@"\e[1;31m%@\e[m", data);
    }
  }
  NSLog(@"\e[1;31mEnd stack\e[m");
}

- (void)write:(NSData *)data {
  @synchronized (self.toSend) {
    NSUInteger length = [data length];
    NSUInteger chunkSize = [self.peripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse];
    NSUInteger offset = 0;
    do {
      NSUInteger thisChunkSize = length - offset > chunkSize ? chunkSize : length - offset;
      NSData* chunk = [NSData dataWithBytesNoCopy:(char *)[data bytes] + offset
                                          length:thisChunkSize
                                    freeWhenDone:NO];
        offset += thisChunkSize;
        [self.toSend addObject:chunk];
    } while (offset < length);
  }
  if (self.isWaiting  == NO) {
    self.isWaiting = YES;
    [self.peripheral writeValue:self.toSend[0] forCharacteristic:[self getWriter] type:CBCharacteristicWriteWithResponse];
  }
}

- (void)popToSend {
  @synchronized (self.toSend) {
    if ([self.toSend count] >= 1) {
      [self.toSend removeObjectAtIndex:0];
    }
    if ([self.toSend count] == 0) {
      self.isWaiting = NO;
    }
  }
}

- (void)checkAndWrite {
   @synchronized (self.toSend) {
    if ([self.toSend count] >= 1) {
      @synchronized (self.toSend) {
        NSData *data = self.toSend[0];
        [self.peripheral writeValue:data forCharacteristic:[self getWriter] type:CBCharacteristicWriteWithResponse];
      }
  }
   }
}

- (void)waitDeviceRdy {
  NSLog(@"w8ting for ma");
  dispatch_semaphore_wait(self.maSema, DISPATCH_TIME_FOREVER);
  NSLog(@"w8ting for peer");
  dispatch_semaphore_wait(self.peerIDSema, DISPATCH_TIME_FOREVER);
  NSLog(@"w8ting for reader");
  dispatch_semaphore_wait(self.readerSema, DISPATCH_TIME_FOREVER);
  NSLog(@"w8ting for accept");
  dispatch_semaphore_wait(self.acceptSema, DISPATCH_TIME_FOREVER);
  AddToPeerStore([self.peerID UTF8String], [self.ma UTF8String]);
  NSLog(@"Device REALLY rdy");
}

- (void)releaseAcceptSema {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    NSLog(@"unlock accept peer");
    dispatch_semaphore_signal(self.acceptSema);
  });
}

- (void)releaseWriterSema {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSLog(@"unlock read peer");
      dispatch_semaphore_signal(self.readerSema);
  });
}

- (void)setIsSubscribe:(BOOL)v {
	_isSubscribe = v;
  NSLog(@"setsubs %@ %@ %d", self.peerID, self.ma, self.isSubscribe);
  NSLog(@"block");
  if (v == YES) {

  }
	if (self.ma != nil && self.peerID != nil) {
        self.isReady = YES;
        NSLog(@"RDY");
    }
}

- (void)setPeerID:(NSString*)p {
    _peerID = p;
    NSLog(@"block");
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSLog(@"unlock peer");
      dispatch_semaphore_signal(self.peerIDSema);
    });
    NSLog(@"setpeer %@ %@ %d", self.ma, p, self.isSubscribe);
    if (self.ma != nil && self.isSubscribe == YES) {
        self.isReady = YES;
		    NSLog(@"RDY");
    }
}

- (void)setMa:(NSString*)a {
    _ma = a;
    NSLog(@"setma %@ %@ %d", self.peerID, a, self.isSubscribe);
    NSLog(@"block");
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      NSLog(@"unlock masema");
      dispatch_semaphore_signal(self.maSema);
    });
    if (self.peerID != nil && self.isSubscribe == YES) {
		NSLog(@"RDY");
        self.isReady = YES;
        NSLog(@"ADD TO PEER STORE");
        NSLog(@"RDY");
    }
}

@end
