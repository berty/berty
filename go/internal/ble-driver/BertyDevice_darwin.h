//
//  BertyDevice.h
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

#import "BleManager_darwin.h"
#import "CircularQueue.h"
#import "BleQueue.h"

#ifndef BertyDevice_h
#define BertyDevice_h
@class BertyDevice;
@class ConnectedPeer;

typedef void (^BertyDeviceConnectCallbackBlockType)(BertyDevice * __nullable, NSError * __nullable);
typedef void (^BertyDeviceServiceCallbackBlockType)(NSArray * __nullable, NSError * __nullable);
typedef void (^BertyDeviceWriteCallbackBlockType)(NSError * __nullable);
#define _BERTY_ON_D_THREAD(block) dispatch_async(self.dQueue, block)
#define _BERTY_ON_W_THREAD(block) dispatch_async(self.writeQueue, block)

@interface BertyDevice : NSObject <CBPeripheralDelegate>

@property (nonatomic, strong, nonnull) NSString *name;
@property (nonatomic, strong, nonnull) NSDictionary *serviceDict;
@property (nonatomic, strong, nullable) CBPeripheral *peripheral;
@property (nonatomic, strong, nonnull) NSString *serverSideIdentifier;
@property (nonatomic, strong, nonnull) NSString *clientSideIdentifier;
@property (nonatomic, assign, nullable) BleManager *manager;
@property (nonatomic, strong, nonnull) BleQueue *queue;
@property (nonatomic, strong, nonnull) BleQueue *writeQ;
@property (nonatomic, strong, nullable) CBCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong, nullable) CBCharacteristic *writerCharacteristic;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicHandlers;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicData;
@property (nonatomic, strong, nullable) NSData *remainingData;
@property (nonatomic, strong, nullable) NSString *remotePeerID;
@property (nonatomic, strong, nullable) CountDownLatch *l2capLatch;
@property (readwrite) int psm;
@property (nonatomic, strong, nullable) ConnectedPeer *peer;
@property (nonatomic, strong, nonnull) CBCentral *cbCentral;
@property (nonatomic, strong, nonnull) CircularQueue *dataCache;

- (instancetype __nullable)initWithIdentifier:(NSString *__nonnull)identifier asClient:(BOOL)client;
- (instancetype __nullable)initWithPeripheral:(CBPeripheral *__nonnull)peripheral central:(BleManager *__nonnull)manager withName:(NSString *__nonnull)name;
- (void)setPeripheral:(CBPeripheral *__nonnull)peripheral central:(BleManager *__nonnull)manager;
- (BOOL)writeToCharacteristic:(NSData *__nonnull)data forCharacteristic:(CBCharacteristic *__nonnull)characteristic withEOD:(BOOL)eod tryL2cap:(BOOL)tryL2cap;
- (void)handshake;
- (void)handleConnect:(NSError * __nullable)error;
- (void)connectWithOptions:(NSDictionary * __nullable)options;
- (void)l2capRead:(ConnectedPeer *__nonnull)peer;
- (NSString *__nonnull)getIdentifier;
- (void)flushCache;

@end

#endif
