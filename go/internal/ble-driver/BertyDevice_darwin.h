//
//  BertyDevice.h
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

#import "ConnectedPeer.h"
#import "CircularQueue.h"
#import "BleQueue.h"
#import "Logger.h"
#import "CountDownLatch_darwin.h"

NS_ASSUME_NONNULL_BEGIN

@class BleManager;

typedef void (^BertyDeviceConnectCallbackBlockType)(BertyDevice * __nullable, NSError * __nullable);
typedef void (^BertyDeviceServiceCallbackBlockType)(NSArray * __nullable, NSError * __nullable);
typedef void (^BertyDeviceWriteCallbackBlockType)(NSError * __nullable);
#define _BERTY_ON_D_THREAD(block) dispatch_async(self.dQueue, block)
#define _BERTY_ON_W_THREAD(block) dispatch_async(self.writeQueue, block)

@interface BertyDevice : NSObject <CBPeripheralDelegate, NSStreamDelegate>

@property (nonatomic, strong, nonnull) Logger *logger;
@property (nonatomic, strong, nonnull) NSString *name;
@property (nonatomic, strong, nonnull) NSDictionary *serviceDict;
@property (nonatomic, strong, nullable) CBPeripheral *peripheral;
@property (nonatomic, strong, nonnull) NSString *serverSideIdentifier;
@property (nonatomic, strong, nonnull) NSString *clientSideIdentifier;
@property (nonatomic, assign, nullable) BleManager *manager;
@property (nonatomic, strong, nonnull) BleQueue *connectionQ;
@property (nonatomic, strong, nonnull) BleQueue *writeQ;
@property (nonatomic, strong, nonnull) BleQueue *readQ;
@property (nonatomic, strong, nullable) NSObject *writerLatch;
@property (nonatomic, strong, nullable) CBCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong, nullable) CBCharacteristic *writerCharacteristic;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicHandlers;
@property (nonatomic, strong, nonnull) NSDictionary* characteristicData;
@property (nonatomic, strong, nullable) NSData *remainingData;
@property (nonatomic, strong, nullable) NSString *remotePeerID;
@property (readwrite) int psm;
@property (nonatomic, strong, nullable) ConnectedPeer *peer;
@property (nonatomic, strong, nonnull) CBCentral *cbCentral;
@property (nonatomic, strong, nonnull) CircularQueue *dataCache;
@property (readwrite) BOOL isDisconnecting;

- (instancetype __nullable)initWithIdentifier:(NSString *__nonnull)identifier logger:(Logger *__nonnull)logger central:(BleManager *__nonnull)manager asClient:(BOOL)client;
- (instancetype __nullable)initWithPeripheral:(CBPeripheral *__nonnull)peripheral logger:(Logger *__nonnull)logger central:(BleManager *__nonnull)manager withName:(NSString *__nonnull)name;
- (void)closeBertyDevice;
- (BOOL)writeToCharacteristic:(NSData *__nonnull)data forCharacteristic:(CBCharacteristic *__nonnull)characteristic withEOD:(BOOL)eod;
- (void)handshake;
- (void)handleConnect:(NSError * __nullable)error;
- (void)connectWithOptions:(NSDictionary * __nullable)options;
- (NSString *__nonnull)getIdentifier;
- (void)flushCache;

@end

API_AVAILABLE(ios(11.0))
@interface BertyDevice()

@property (strong, nullable) NSThread *l2capThread;
@property (strong, nullable) CBL2CAPChannel *l2capChannel;
@property (strong, nullable) NSData *l2capWriteData;
@property (readwrite) NSInteger l2capWriteIndex;
@property (readwrite) BOOL useL2cap;
@property (readwrite) BOOL l2capClientHandshakeRunning;
@property (readwrite) BOOL l2capServerHandshakeRunning;
@property (strong, nullable) CountDownLatch *l2capHandshakeLatch;
@property (readwrite) BOOL l2capHandshakeStepStatus;
@property (copy, nullable) dispatch_block_t l2capHandshakeBlock;
@property (strong, nullable) NSMutableData *l2capHandshakeData;
@property (strong, nullable) NSMutableData *l2capHandshakeRecvData;
@property (readwrite) NSUInteger l2capHandshakeRecvDataLen;

- (BOOL)l2capWrite:(NSData *__nonnull)data;

@end
NS_ASSUME_NONNULL_END
