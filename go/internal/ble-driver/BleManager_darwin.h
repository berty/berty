//
//  BleManager.h
//  ble
//
//  Created by sacha on 23/05/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "CountDownLatch_darwin.h"
#import "BleInterface_darwin.h"

#ifndef BleManager_h
#define BleManager_h
@class BertyDevice;

#define _BERTY_ON_M_THREAD(block) dispatch_async(self.dQueue, block)

@interface BleManager : NSObject <CBPeripheralManagerDelegate, CBCentralManagerDelegate>

+ (CBUUID *__nonnull)serviceUUID;
+ (CBUUID *__nonnull)peerUUID;
+ (CBUUID *__nonnull)writerUUID;

@property (readwrite) BOOL pmEnable;
@property (readwrite) BOOL cmEnable;
@property (nonatomic, strong, nonnull) CBMutableService *bertyService;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *writerCharacteristic;
@property (nonatomic, strong, nullable) NSString *peerID;
@property (nonatomic, strong, nonnull) CBUUID *serviceUUID;
@property (nonatomic, strong, nonnull) CBUUID *peerUUID;
@property (nonatomic, strong, nonnull) CBUUID *writerUUID;
@property (nonatomic, strong, nonnull) NSMutableArray *bDevices;
@property (nonatomic, strong, nonnull) CBCentralManager* cManager;
@property (nonatomic, strong, nonnull) CBPeripheralManager* pManager;
@property (nonatomic, strong, nonnull) dispatch_queue_t dQueue;
@property (nonatomic, readwrite, strong) CountDownLatch* __nonnull bleOn;
@property (nonatomic, readwrite, strong) CountDownLatch* __nonnull serviceAdded;

- (instancetype __nonnull) initScannerAndAdvertiser;
- (void)addService;
- (void)startScanning;
- (void)stopScanning;
- (void)startAdvertising;
- (void)stopAdvertising;
- (void)cancelPeripheralConnection:(CBPeripheral *__nonnull)peripheral;
- (void)cancelAllPeripheralConnections;
- (BertyDevice *__nullable)findPeripheralFromIdentifier:(NSUUID *__nonnull)identifier;
- (BertyDevice *__nullable)findPeripheralFromPID:(NSString *__nonnull)peerID;

@end

#endif
