//
//  BertyDevice.h
//  bluetooth
//
//  Created by sacha on 18/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "CountDownLatch.h"

#ifndef BertyDevice_h
#define BertyDevice_h

//extern void AddToPeerStoreC(char *, char*);

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
@property (atomic, readwrite, strong) CBCharacteristic *closer;
@property (atomic, readwrite, strong) CBCharacteristic *peerIDChar;
@property (atomic, readwrite, strong) CBCharacteristic *maChar;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t writeWaiter;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t closerWaiterSema;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t connSema;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t svcSema;
@property (nonatomic, readwrite, strong) CountDownLatch *latchRdy;
@property (nonatomic, readwrite, strong) CountDownLatch *latchChar;
@property (nonatomic, readwrite, strong) CountDownLatch *latchRead;
@property (nonatomic, readwrite, strong) CountDownLatch *latchOtherRead;
@property (nonatomic, strong) CBCentralManager *centralManager;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral withCentralManager:(CBCentralManager *)manager;
- (void)write:(NSData *)data;
- (void)checkAndWrite;
- (void)popToSend;

@end

#endif
