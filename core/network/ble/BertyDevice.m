// +build darwin
//
//  BertyDevice.m
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyDevice.h"
#include "_cgo_export.h"

@implementation BertyDevice

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral withCentralManager:(CBCentralManager *)manager {
    self = [super init];
    self.peripheral = peripheral;
    self.centralManager = manager;
    self.toSend = [[NSMutableArray alloc]init];
    self.closed = NO;
    self.isWaiting = NO;
    self.closedSend = NO;
    self.didRdySema = NO;
    self.connSema = dispatch_semaphore_create(0);
    self.closerWaiterSema = dispatch_semaphore_create(0);
    self.acceptWaiterSema = dispatch_semaphore_create(0);
    self.writeWaiter = dispatch_semaphore_create(0);
    self.svcSema = dispatch_semaphore_create(0);
    self.dispatch_queue = dispatch_queue_create("BertyDevice", DISPATCH_QUEUE_CONCURRENT);
    self.latchRdy = [[CountDownLatch alloc] init:2];
    self.latchChar = [[CountDownLatch alloc] init:6];
    self.latchRead = [[CountDownLatch alloc] init:2];
    dispatch_async(self.dispatch_queue, ^{
        [self waitLatchRdy];
    });

    dispatch_async(self.dispatch_queue, ^{
        [self waitOurConn];
    });
    
    return self;
}

- (void)waitLatchRdy {
    NSLog(@"Start waiting latch rdy");
    [self.latchRdy await];
    NSLog(@"Stopped waiting latch rdy");
    NSLog(@"Need to call other device is rdy");
    AddToPeerStoreC([self.peerID UTF8String], [self.ma UTF8String]);
}

- (void)waitOurConn {
    NSLog(@"Start waiting conn sema");
    dispatch_semaphore_wait(self.connSema, DISPATCH_TIME_FOREVER);
    NSLog(@"Stop waiting conn sema");
    NSLog(@"Start waiting svc sema");
    dispatch_semaphore_wait(self.svcSema, DISPATCH_TIME_FOREVER);
    NSLog(@"Stop waiting svc sema");
    NSLog(@"Start waiting latch char");
    [self.latchChar await];
    NSLog(@"Start waiting latch read");
    [self.latchRead await];
    NSLog(@"Need to tell rdy");
    [self.peripheral writeValue:[[NSData alloc]init] forCharacteristic:self.isRdy type:CBCharacteristicWriteWithResponse];
}

- (void)writeIsRdy {
    dispatch_async(self.dispatch_queue, ^{
        [NSThread sleepForTimeInterval:1.0f];
        [self.peripheral writeValue:[[NSData alloc]init] forCharacteristic:self.isRdy type:CBCharacteristicWriteWithResponse];
    });
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
        [self.peripheral writeValue:self.toSend[0] forCharacteristic:self.writer type:CBCharacteristicWriteWithResponse];
        dispatch_semaphore_wait(self.writeWaiter, DISPATCH_TIME_FOREVER);
    }
}

- (void)popToSend {
    @synchronized (self.toSend) {
        if ([self.toSend count] >= 1) {
            [self.toSend removeObjectAtIndex:0];
        }
        if ([self.toSend count] == 0) {
            self.isWaiting = NO;
            dispatch_semaphore_signal(self.writeWaiter);
        }
    }
}

- (void)checkAndWrite {
    if (self.closed == YES && self.closedSend == NO) {
        self.closedSend = YES;
        [self.peripheral writeValue:[[NSData alloc] init] forCharacteristic:self.closer type:CBCharacteristicWriteWithResponse];
    }
    @synchronized (self.toSend) {
        if ([self.toSend count] >= 1) {
            NSData *data = self.toSend[0];
            [self.peripheral writeValue:data forCharacteristic:self.writer type:CBCharacteristicWriteWithResponse];
        }
    }
}


@end
