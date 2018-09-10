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
#import "MyDefer.h"

@interface BertyDevice : NSObject

@property (nonatomic, readwrite, strong) NSMutableData *data;
@property (nonatomic, readwrite, strong) NSMutableArray *toSend;
@property (nonatomic, readonly, strong) NSString *peerID;
@property (nonatomic, readonly, strong) NSString *ma;
@property (nonatomic, readwrite, assign) BOOL isReady;
@property (nonatomic, readwrite, assign) BOOL isWaiting;
@property (nonatomic, readwrite, assign) BOOL isSubscribe;
@property (nonatomic, readwrite, strong) CBPeripheral *peripheral;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t isRdy;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t acceptSema;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t maSema;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t peerIDSema;
@property (nonatomic, readwrite, strong) dispatch_semaphore_t readerSema;

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral;
- (void)setPeerID:(NSString*)p;
- (void)setMa:(NSString*)a;
- (void)setIsSubscribe:(BOOL)v;

@end

#endif
