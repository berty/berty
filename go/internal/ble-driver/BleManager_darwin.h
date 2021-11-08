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
#import "WriteDataCache.h"

#ifndef BleManager_h
#define BleManager_h

@class BertyDevice;

@interface BleManager : NSObject <CBPeripheralManagerDelegate, CBCentralManagerDelegate>

+ (CBUUID *__nonnull)serviceUUID;
+ (CBUUID *__nonnull)peerUUID;
+ (CBUUID *__nonnull)writerUUID;
+ (NSString *__nonnull)NSDataToHex:(NSData *__nonnull)data;
+ (void) printLongLog:(NSString *__nonnull)message;

@property (readwrite) BOOL pmEnable;
@property (readwrite) BOOL cmEnable;
@property (readwrite) int psm;
@property (nonatomic, strong, nonnull) CBMutableService *bertyService;
@property (nonatomic, strong, nonnull) CBMutableService *nameService;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *writerCharacteristic;
@property (nonatomic, strong, nullable) NSString *localPID;
@property (nonatomic, strong, nonnull) NSString *ID;
@property (nonatomic, strong, nonnull) CBUUID *serviceUUID;
@property (nonatomic, strong, nonnull) CBUUID *peerUUID;
@property (nonatomic, strong, nonnull) CBUUID *writerUUID;
@property (nonatomic, strong, nonnull) NSMutableArray *bDevices;
@property (nonatomic, strong, nonnull) CBCentralManager* cManager;
@property (nonatomic, strong, nonnull) CBPeripheralManager* pManager;
@property (nonatomic, strong, nonnull) CountDownLatch *bleOn;
@property (nonatomic, strong, nonnull) CountDownLatch *serviceAdded;
@property (nonatomic, strong, nullable) NSTimer *scannerTimer;
@property (nonatomic, readwrite, getter=isScanning) BOOL scanning;
@property (nonatomic, strong, nullable) WriteDataCache *writeCache;
@property (nonatomic, strong, nullable) CountDownLatch *writerLactch;
@property (readwrite) BOOL writeStatus;

- (instancetype __nonnull) initScannerAndAdvertiser;
- (void)addService;
- (void)startScanning;
- (void)toggleScanner:(NSTimer *__nonnull)timer;
- (void)stopScanning;
- (void)startAdvertising;
- (void)stopAdvertising;
- (void)disconnect:(BertyDevice *__nonnull)device;
- (void)closeAllConnections;
- (BertyDevice *__nullable)findPeripheralFromIdentifier:(NSUUID *__nonnull)identifier;
- (BertyDevice *__nullable)findPeripheralFromPID:(NSString *__nonnull)peerID;
- (BOOL)writeAndNotify:(BertyDevice *__nonnull)device data:(NSData *__nonnull)data;

@end

#endif
