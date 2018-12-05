//
//  BertyUtils.h
//  ble
//
//  Created by sacha on 29/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//


#import "BertyDevice.h"

#ifndef BertyUtils_h
#define BertyUtils_h

#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

extern CBCentralManager *centralManager;
extern CBPeripheralManager *peripheralManager;

@interface BertyUtils : NSObject

@property (nonatomic, strong) CBMutableService *bertyService;
@property (nonatomic, strong) CBMutableCharacteristic *maCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *writerCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *closerCharacteristic;
@property (nonatomic, strong) NSString *ma;
@property (nonatomic, strong) NSString *peerID;
@property (nonatomic, strong) CBUUID *serviceUUID;
@property (nonatomic, strong) CBUUID *maUUID;
@property (nonatomic, strong) CBUUID *peerUUID;
@property (nonatomic, strong) CBUUID *writerUUID;
@property (nonatomic, strong) CBUUID *closerUUID;
@property (nonatomic, strong) NSMutableDictionary *bertyDevices;
@property (nonatomic, assign) BOOL CentralIsOn;
@property (nonatomic, assign) BOOL PeripharalIsOn;
@property (atomic, assign) BOOL serviceAdded;


+ (NSString *)arrayServiceToSting:(NSArray *)array;
+ (NSString *)arrayCharacteristicToSting:(NSArray *)array;
+ (BertyUtils *)sharedUtils;
+ (nullable BertyDevice *)getDevice:(CBPeripheral *)peripheral;
+ (nullable BertyDevice *)getDeviceFromRequest:(CBATTRequest *)request;
+ (nullable BertyDevice *)getDeviceFromMa:(NSString *)ma;
+ (nullable BertyDevice *)getDeviceFromPeerID:(NSString *)peerID;
+ (Boolean)inDevices:(CBPeripheral *)peripheral;
+ (Boolean)inDevicesWithPeerID:(NSString *)peerID;
+ (Boolean)inDevicesWithMa:(NSString *)Ma;
+ (void)setMa:(NSString *)ma;
+ (void)setPeerID:(NSString *)peerID;
+ (void)addDevice:(BertyDevice *)device;
+ (void)removeDevice:(BertyDevice *)device;

@end

#endif
