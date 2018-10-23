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

@interface BertyDevice : NSObject

@property (nonatomic, readwrite, strong) NSMutableArray *toSend;
@property (nonatomic, readwrite, strong) NSString *peerID;
@property (nonatomic, readwrite, strong) NSString *ma;
@property (nonatomic, readwrite, assign) BOOL isWaiting;
@property (nonatomic, readwrite, strong) CBPeripheral *peripheral;
@property (atomic, readwrite, strong) dispatch_semaphore_t connSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t svcSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t acceptSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t maSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t peerIDSema;
@property (atomic, readwrite, strong) dispatch_semaphore_t writerSema;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral;
- (void)write:(NSData *)data;
- (void)checkAndWrite;
- (void)popToSend;

@end

#endif
