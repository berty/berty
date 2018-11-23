//
//  BertyDevice.h
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#ifndef BertyDevice_h
#define BertyDevice_h

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "CountDownLatch.h"

@interface BertyDevice : NSObject

@property (nonatomic, readwrite, strong) NSMutableArray *toSend;
@property (nonatomic, readwrite, strong) NSString *peerID;
@property (nonatomic, readwrite, strong) NSString *ma;
@property (nonatomic, readwrite, assign) BOOL isWaiting;
@property (nonatomic, strong) dispatch_queue_t dispatch_queue;
@property (atomic, readwrite, assign) BOOL closedSend;
@property (atomic, readwrite, assign) BOOL closed;
@property (atomic, readwrite, assign) BOOL didRdySema;
@property (atomic, readwrite, strong) CBPeripheral *peripheral;
@property (atomic, readwrite, strong) CBService *svc;
@property (atomic, readwrite, strong) CBCharacteristic *writer;
@property (atomic, readwrite, strong) CBCharacteristic *isRdy;
@property (atomic, readwrite, strong) CBCharacteristic *closer;
@property (atomic, readwrite, strong) CBCharacteristic *accepter;
@property (atomic, readwrite, strong) CBCharacteristic *peerIDChar;
@property (atomic, readwrite, strong) CBCharacteristic *maChar;
@property (atomic, readwrite, strong) dispatch_semaphore_t writeWaiter;
@property (atomic, readwrite, strong) dispatch_semaphore_t acceptWaiterSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t closerWaiterSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t connSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t svcSema;
@property (nonatomic, readwrite, strong) CountDownLatch *latchRdy;
@property (nonatomic, readwrite, strong) CountDownLatch *latchChar;
@property (nonatomic, readwrite, strong) CountDownLatch *latchRead;
@property (nonatomic, strong) CBCentralManager *centralManager;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral withCentralManager:(CBCentralManager *)manager;
- (void)write:(NSData *)data;
- (void)checkAndWrite;
- (void)popToSend;
- (void)writeIsRdy;

@end

#endif
