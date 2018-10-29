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

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral {
    self = [super init];
    self.peripheral = peripheral;
    self.toSend = [[NSMutableArray alloc]init];
    self.closed = NO;
    self.isWaiting = NO;
    self.closedSend = NO;
    self.didRdySema = NO;
    self.connSema = dispatch_semaphore_create(0);
    self.closerWaiterSema = dispatch_semaphore_create(0);
    self.acceptWaiterSema = dispatch_semaphore_create(0);
    self.closerSema = dispatch_semaphore_create(0);
    self.writeWaiter = dispatch_semaphore_create(0);
    self.svcSema = dispatch_semaphore_create(0);
    self.isRdySema = dispatch_semaphore_create(0);
    self.acceptSema = dispatch_semaphore_create(0);
    self.maSema = dispatch_semaphore_create(0);
    self.peerIDSema = dispatch_semaphore_create(0);
    self.writerSema = dispatch_semaphore_create(0);
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
