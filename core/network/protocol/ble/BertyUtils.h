//
//  BertyUtils.h
//  ble
//
//  Created by sacha on 29/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//


#import "BertyDevice.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

#ifndef BertyUtils_h
#define BertyUtils_h

extern CBCentralManager *__nullable centralManager;
extern CBPeripheralManager *__nullable peripheralManager;

@interface BertyUtils : NSObject

@property (nonatomic, strong, nonnull) CBMutableService *bertyService;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *maCharacteristic;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *writerCharacteristic;
@property (nonatomic, strong, nonnull) CBMutableCharacteristic *closerCharacteristic;
@property (nonatomic, strong, nullable) NSString *ma;
@property (nonatomic, strong, nullable) NSString *peerID;
@property (nonatomic, strong, nonnull) CBUUID *serviceUUID;
@property (nonatomic, strong, nonnull) CBUUID *maUUID;
@property (nonatomic, strong, nonnull) CBUUID *peerUUID;
@property (nonatomic, strong, nonnull) CBUUID *writerUUID;
@property (nonatomic, strong, nonnull) CBUUID *closerUUID;
@property (nonatomic, strong, nonnull) NSMutableDictionary *bertyDevices;
@property (nonatomic, assign) BOOL CentralIsOn;
@property (nonatomic, assign) BOOL PeripharalIsOn;
@property (atomic, assign) BOOL serviceAdded;

+ (nonnull NSString *)arrayServiceToSting:(nonnull NSArray *)array;
+ (nonnull NSString *)arrayCharacteristicToSting:(nonnull NSArray *)array;
+ (nonnull BertyUtils *)sharedUtils;
+ (nullable BertyDevice *)getDevice:(nonnull CBPeripheral *)peripheral;
+ (nullable BertyDevice *)getDeviceFromRequest:(nonnull CBATTRequest *)request;
+ (nullable BertyDevice *)getDeviceFromMa:(nonnull NSString *)ma;
+ (nullable BertyDevice *)getDeviceFromPeerID:(nonnull NSString *)peerID;
+ (Boolean)inDevices:(nonnull CBPeripheral *)peripheral;
+ (Boolean)inDevicesWithPeerID:(nonnull NSString *)peerID;
+ (Boolean)inDevicesWithMa:(nonnull NSString *)Ma;
+ (void)setMa:(nonnull NSString *)ma;
+ (void)setPeerID:(nonnull NSString *)peerID;
+ (void)addDevice:(nonnull BertyDevice *)device;
+ (void)removeDevice:(nonnull BertyDevice *)device;
+ (void)removeAllDevices;

@end

#endif
