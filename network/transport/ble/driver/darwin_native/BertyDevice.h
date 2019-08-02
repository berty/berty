//
//  BertyDevice.h
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import "BleManager.h"
#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

#ifndef BertyDevice_h
#define BertyDevice_h
@class BertyDevice;

typedef void (^BertyDeviceConnectCallbackBlockType)(BertyDevice * __nullable, NSError * __nullable);
typedef void (^BertyDeviceServiceCallbackBlockType)(NSArray * __nullable, NSError * __nullable);
typedef void (^BertyDeviceWriteCallbackBlockType)(NSError * __nullable);
#define _BERTY_ON_D_THREAD(block) dispatch_async(self.dQueue, block)

@interface BertyDevice : NSObject <CBPeripheralDelegate>

@property (nonatomic, strong, nonnull) NSDictionary *serviceDict;
@property (readwrite) BOOL isConnected;
@property (readwrite) BOOL maSend;
@property (readwrite) BOOL peerIDSend;
@property (readwrite) BOOL maRecv;
@property (readwrite) BOOL peerIDRecv;
@property (nonatomic, strong, nonnull) CBPeripheral *peripheral;
@property (nonatomic, strong, nonnull) BleManager *manager;
@property (nonatomic, strong, nonnull) dispatch_queue_t dQueue;
@property (nonatomic, strong, nonnull) dispatch_queue_t writeQueue;
@property (nonatomic, strong, nullable) CBCharacteristic *ma;
@property (nonatomic, strong, nullable) CBCharacteristic *peerID;
@property (nonatomic, strong, nullable) CBCharacteristic *writer;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicHandlers;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicDatas;
@property (nonatomic, strong, nullable) CBCentral* remoteCentral;
@property (nonatomic, strong, nullable) NSMutableData *remainingData;
@property (nonatomic, strong, nullable) NSString *remoteMa;
@property (nonatomic, strong, nullable) NSString *remotePeerID;

- (instancetype __nullable)initWithPeripheral:(CBPeripheral *__nonnull)peripheral central:(BleManager *__nonnull)manager;
- (void)writeToCharacteristic:(NSMutableData *__nonnull)data forCharacteristic:(CBCharacteristic *__nonnull)characteristic withEOD:(BOOL)eod andBlock:(void (^__nonnull)(NSError *__nullable))writeCallback;
- (void)handshake;
- (void)handleConnect:(NSError * __nullable)error;
- (void)connectWithOptions:(NSDictionary * __nullable)options withBlock:(BertyDeviceConnectCallbackBlockType __nonnull)connectCallback;

@property (nonatomic, copy, nullable) BertyDeviceConnectCallbackBlockType connectCallback;
@property (nonatomic, copy, nullable) BertyDeviceServiceCallbackBlockType serviceCallback;
@property (nonatomic, copy, nullable) BertyDeviceServiceCallbackBlockType characteristicCallback;
@property (nonatomic, copy, nullable) BertyDeviceWriteCallbackBlockType writeCallback;

@end

#endif
