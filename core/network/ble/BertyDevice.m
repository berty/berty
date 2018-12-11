// +build darwin
//
//  BertyDevice.m
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyDevice.h"
#import "BertyUtils.h"
#import "_cgo_export.h"

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
    self.writeWaiter = dispatch_semaphore_create(1);
    self.svcSema = dispatch_semaphore_create(0);
    self.dispatch_queue = dispatch_queue_create("BertyDevice", DISPATCH_QUEUE_CONCURRENT);
    self.latchRdy = [[CountDownLatch alloc] init:2];
    self.latchChar = [[CountDownLatch alloc] init:4];
    self.latchRead = [[CountDownLatch alloc] init:2];
    self.latchOtherRead = [[CountDownLatch alloc] init:2];
    [self waitLatchRdy];
    [self waitConn];
    return self;
}

- (void)waitLatchRdy {
    NSLog(@"waitLatchRdy");
    dispatch_async(self.dispatch_queue, ^{
        [self.latchRdy await];
        AddToPeerStoreC([self.peerID UTF8String], [self.ma UTF8String]);
    });
}

- (void)waitConn {
    NSLog(@"waitConn");
    dispatch_async(self.dispatch_queue, ^{
        dispatch_semaphore_wait(self.connSema, DISPATCH_TIME_FOREVER);
        [self waitService];
        [self.peripheral discoverServices:@[[BertyUtils sharedUtils].serviceUUID]];
    });
}

- (void)waitService {
    NSLog(@"waitService");
    dispatch_async(self.dispatch_queue, ^{
        dispatch_semaphore_wait(self.svcSema, DISPATCH_TIME_FOREVER);
        [self waitChar];
        BertyUtils *utils = [BertyUtils sharedUtils];
        [self.peripheral discoverCharacteristics:@[
                                                   utils.maUUID,
                                                   utils.peerUUID,
                                                   utils.closerUUID,
                                                   utils.writerUUID,
                                                   ]
                                      forService:self.svc];
    });
}

- (void)waitWriteMaThenPeerID {
    NSLog(@"waitRead");
    dispatch_async(self.dispatch_queue, ^{
        @synchronized (self.toSend) {
            NSData *value = [[BertyUtils sharedUtils].ma dataUsingEncoding:NSUTF8StringEncoding];
            NSUInteger length = [value length];
            NSUInteger chunkSize = [self.peripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse];
            NSUInteger offset = 0;
            do {
                NSUInteger thisChunkSize = length - offset > chunkSize ? chunkSize : length - offset;
                NSData* chunk = [NSData dataWithBytesNoCopy:(char *)[value bytes] + offset
                                                     length:thisChunkSize
                                               freeWhenDone:NO];
                offset += thisChunkSize;
                [self.toSend addObject:chunk];
            } while (offset < length);
            while ([self.toSend count] > 0) {
                NSLog(@"Ma 1st [self.toSend count] %lu", [self.toSend count]);
                dispatch_semaphore_wait(self.writeWaiter, DISPATCH_TIME_FOREVER);
                [self.peripheral writeValue:self.toSend[0] forCharacteristic:self.maChar type:CBCharacteristicWriteWithResponse];
                NSLog(@"Ma 2st [self.toSend count] %lu", [self.toSend count]);
                [self.toSend removeObjectAtIndex:0];
                NSLog(@"Ma 3st [self.toSend count] %lu", [self.toSend count]);
            }

            value = [[BertyUtils sharedUtils].peerID dataUsingEncoding:NSUTF8StringEncoding];
            length = [value length];
            chunkSize = [self.peripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse];
            offset = 0;
            do {
                NSUInteger thisChunkSize = length - offset > chunkSize ? chunkSize : length - offset;
                NSData* chunk = [NSData dataWithBytesNoCopy:(char *)[value bytes] + offset
                                                     length:thisChunkSize
                                               freeWhenDone:NO];
                offset += thisChunkSize;
                [self.toSend addObject:chunk];
            } while (offset < length);

            while ([self.toSend count] > 0) {
                NSLog(@"pa 1st [self.toSend count] %lu", [self.toSend count]);
                dispatch_semaphore_wait(self.writeWaiter, DISPATCH_TIME_FOREVER);
                [self.peripheral writeValue:self.toSend[0] forCharacteristic:self.peerIDChar type:CBCharacteristicWriteWithResponse];
                [self.toSend removeObjectAtIndex:0];
            }
            NSLog(@"pa 1st COUNTDOWN " );
            [self.latchRdy countDown];
        }
    });
}

- (void)waitChar {
    NSLog(@"waitChar");
    dispatch_async(self.dispatch_queue, ^{
        [self.latchChar await];
        [self waitWriteMaThenPeerID];
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
