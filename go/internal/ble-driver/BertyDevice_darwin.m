// +build darwin
//
//  BertyDevice.m
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <os/log.h>

#import "BleInterface_darwin.h"
#import "BertyDevice_darwin.h"
#import "CircularQueue.h"

extern unsigned short handlePeerFound(char *, char *);
extern void receiveFromDevice(char *, void *, int);

static NSString* const __nonnull EOD = @"EOD";

CBService *getService(NSArray *services, NSString *uuid) {
    CBService *result = nil;

    for (CBService *service in services) {
        if ([[service.UUID UUIDString] isEqual:uuid]) {
            result = service;
        }
    }
    return result;
}

@implementation BertyDevice

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral
                           central:(BleManager *)manager {
    self = [self initWithIdentifier:[peripheral.identifier UUIDString]];

    if (self) {
        [self setPeripheral:peripheral central:manager];
    }

    return self;
}

- (instancetype)initWithIdentifier:(NSString *)identifier {
    self = [super init];

    if (self) {
        self.identifier = identifier;
        self.peripheral = nil;
        self.manager = nil;
        self.peerIDSend = FALSE;
        self.peerIDRecv = FALSE;

        self.dQueue = dispatch_queue_create([[NSString stringWithFormat:@"%@%@", @"BertyDevice-", identifier]
                                             cStringUsingEncoding:NSASCIIStringEncoding],
                                            DISPATCH_QUEUE_SERIAL);

        self.writeQueue = dispatch_queue_create([[NSString stringWithFormat:@"%@%@", @"WriteBertyDevice-", identifier]
                                             cStringUsingEncoding:NSASCIIStringEncoding],
                                            DISPATCH_QUEUE_SERIAL);

        BOOL (^peerIDHandler)(NSData *data) = ^BOOL(NSData *data) {
            return [self handlePeerID:data];
        };

        BOOL (^writeHandler)(NSData *data) = ^BOOL(NSData *data) {
            BLEBridgeReceiveFromPeer(self.remotePeerID, data);
            return TRUE;
        };

        self.characteristicHandlers = @{
                                        [BleManager.writerUUID UUIDString]: [writeHandler copy],
                                        [BleManager.peerUUID UUIDString]: [peerIDHandler copy],
                                        };

        self.characteristicDatas = @{
                                     [BleManager.writerUUID UUIDString]: [NSMutableData data],
                                     [BleManager.peerUUID UUIDString]: [NSMutableData data],
                                     };
    }

    return self;
}

- (void)setPeripheral:(CBPeripheral *)peripheral central:(BleManager *)manager {
    self.peripheral = peripheral;
    self.manager = manager;
}

- (BOOL)handlePeerID:(NSData *)peerIDData {
    NSMutableData *tmpData = [self.characteristicDatas objectForKey:[BleManager.peerUUID UUIDString]];
    
    if ([peerIDData isEqual:[EOD dataUsingEncoding:NSUTF8StringEncoding]]) {
        // adding 0 byte
        unsigned char zeroByte = 0;
        @synchronized (tmpData) {
            [tmpData appendBytes:&zeroByte length:1];
        }
        
        NSString *remotePeerID = [NSString stringWithUTF8String:[tmpData bytes]];
        os_log(OS_LOG_BLE, "handlePeerID() device %{public}@ with current peerID %{public}@, new peerID %{public}@", [self.peripheral.identifier UUIDString], self.remotePeerID, remotePeerID);
        self.remotePeerID = remotePeerID;
        self.peerIDRecv = TRUE;
        if (![self checkAndHandleFoundPeer]) {
            [self.manager cancelPeripheralConnection:self.peripheral];
            return FALSE;
        }
    } else {
        @synchronized (tmpData) {
            // reset tmpData
            [tmpData setLength:0];
            
            [tmpData appendData:[peerIDData copy]];
        }
    }
    return TRUE;
}

- (BOOL)checkAndHandleFoundPeer {
    if (self.peerIDSend == TRUE && self.peerIDRecv == TRUE) {
        os_log_debug(OS_LOG_BLE, "checkAndHandleFoundPeer() device %{public}@ handling found peer %{public}@", [self.peripheral.identifier UUIDString], self.remotePeerID);
        if (!BLEBridgeHandleFoundPeer(self.remotePeerID)) {
            os_log_error(OS_LOG_BLE, "checkAndHandleFoundPeer() failed: golang can't handle new peer %{public}@", [self.peripheral.identifier UUIDString]);
            return FALSE;
        }
        os_log(OS_LOG_BLE, "checkAndHandleFoundPeer() successful");
    }
    return TRUE;
}

// Need to copy blocks into the heap because writing is async and the handshake function's stack should not be available
- (void)handshake {
    dispatch_async(self.dQueue, ^{
        [self connectWithOptions:nil
            withBlock:[^(BertyDevice* device, NSError *error){
            if (error) {
                os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ connection failed %{public}@", [device.peripheral.identifier UUIDString], error);
                [self.manager cancelPeripheralConnection:self.peripheral];
                return;
            }
            os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ connection succeed", [device.peripheral.identifier UUIDString]);
            [self discoverServices:@[self.manager.serviceUUID] withBlock:[^(NSArray *services, NSError *error) {
                if (error) {
                    os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ discover service failed: %{public}@", [device.peripheral.identifier UUIDString], error);
                    [self.manager cancelPeripheralConnection:self.peripheral];
                    return;
                }
                os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ service discover succeed", [device.peripheral.identifier UUIDString]);
                CBService *service = getService(services, [self.manager.serviceUUID UUIDString]);
                if (service == nil) {
                    os_log_debug(OS_LOG_BLE, "handshake() service not found");
                    [self.manager cancelPeripheralConnection:self.peripheral];
                    return;
                }
                [self discoverCharacteristics:@[self.manager.peerUUID, self.manager.writerUUID,] forService:service withBlock:[^(NSArray *chars, NSError *error) {
                    if (error) {
                        os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ discover characteristic failed: %{public}@", [device.peripheral.identifier UUIDString], error);
                        [self.manager cancelPeripheralConnection:self.peripheral];
                        return;
                    }
                    os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ discover characteristic succeed", [device.peripheral.identifier UUIDString]);
                    for (CBCharacteristic *chr in chars) {
                        if ([chr.UUID isEqual:self.manager.peerUUID]) {
                            self.peerID = chr;
                            os_log_debug(OS_LOG_BLE, "handshake() peerID characteristic found");
                        } else if ([chr.UUID isEqual:self.manager.writerUUID]) {
                            self.writer = chr;
                            os_log_debug(OS_LOG_BLE, "handshake() writer characteristic found");
                        }
                    }
                    if (self.peerID == nil || self.writer == nil) {
                        os_log_debug(OS_LOG_BLE, "handshake() characteristic not found");
                        [self.manager cancelPeripheralConnection:self.peripheral];
                        return ;
                    }

                    [self writeToCharacteristic:[[self.manager.peerID dataUsingEncoding:NSUTF8StringEncoding] mutableCopy] forCharacteristic:self.peerID withEOD:TRUE andBlock:[^(NSError *error) {
                        if (error) {
                            os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ write peerID failed %{public}@", [device.peripheral.identifier UUIDString], error);
                            [self.manager cancelPeripheralConnection:self.peripheral];
                            return;
                        }
                        os_log_debug(OS_LOG_BLE, "handshake() device %{public}@ write peerID succeed", [device.peripheral.identifier UUIDString]);
                        self.peerIDSend = TRUE;
                        if (![self checkAndHandleFoundPeer]) {
                            [self.manager cancelPeripheralConnection:self.peripheral];
                        }
                    } copy]];
                } copy]];
            } copy]];
        } copy]];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices {
    CBService *service = getService(invalidatedServices, [BleManager.serviceUUID UUIDString]);
    if (service == nil) {
        return;
    }
    os_log_debug(OS_LOG_BLE, "didModifyServices() with invalidated %{public}@", invalidatedServices);
    self.peerIDSend = FALSE;
    self.peerIDRecv = FALSE;

    [self.manager cancelPeripheralConnection:peripheral];
}

- (void)handleConnect:(NSError *)error {
    _BERTY_ON_D_THREAD(^{
        self.connectCallback(self, error);
        self.connectCallback = nil;
    });
}

- (void)connectWithOptions:(NSDictionary *)options withBlock:(void (^)(BertyDevice *, NSError *))connectCallback {
    _BERTY_ON_D_THREAD(^{
        self.connectCallback = connectCallback;
        [self.manager.cManager connectPeripheral:self.peripheral options:nil];
    });
}

#pragma mark - write functions

- (NSData *)getDataToSend {
    NSData *result = nil;

    if (self.remainingData == nil || self.remainingData.length <= 0) {
        return result;
    }

    NSUInteger chunckSize = self.remainingData.length > [self.peripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse] ? [self.peripheral maximumWriteValueLengthForType:CBCharacteristicWriteWithResponse] : self.remainingData.length;

    result = [NSData dataWithBytes:[self.remainingData bytes] length:chunckSize];

    if (self.remainingData.length <= chunckSize) {
        self.remainingData = nil;
    } else {
        [self.remainingData setData:[[NSData alloc]
                                 initWithBytes:[self.remainingData mutableBytes] + chunckSize
                                 length:[self.remainingData length] - chunckSize]];
    }

    return result;
}

- (void)writeToCharacteristic:(NSMutableData *)data forCharacteristic:(CBCharacteristic *)characteristic withEOD:(BOOL)eod andBlock:(void (^)(NSError *))writeCallback {
    dispatch_async(self.writeQueue, ^{
        os_log_debug(OS_LOG_BLE, "writeToCharacteristic() data: %{public}@", data);
        NSData *toSend = nil;
        __block NSError *blockError = nil;

        self.remainingData = data;
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);

        while (self.remainingData.length > 0) {
            toSend = [self getDataToSend];

            [self writeValue:toSend forCharacteristic:characteristic withBlock:^(NSError *error){
                blockError = [error copy];
                dispatch_semaphore_signal(sema);
            }];
            dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
            if (blockError != nil) {
                os_log_error(OS_LOG_BLE, "writeToCharacteristic write data error: %{public}@", blockError);
                break ;
            }
        }
        if (eod && blockError == nil) {
            [self writeValue:[@"EOD" dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:characteristic withBlock:^(NSError *error){
                blockError = [error copy];
                dispatch_semaphore_signal(sema);
            }];
            dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
            if (blockError != nil) {
                os_log_error(OS_LOG_BLE, "writeToCharacteristic write EOD error: %{public}@", blockError);
            }
        }
        writeCallback(blockError);
        dispatch_release(sema);
    });
}

- (void)writeValue:(NSData *)value forCharacteristic:(nonnull CBCharacteristic *)characteristic withBlock:(void (^)(NSError * __nullable))writeCallback {
    _BERTY_ON_D_THREAD(^{
        self.writeCallback = writeCallback;
        [self.peripheral writeValue:value forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    _BERTY_ON_D_THREAD(^{
        void (^writeCallback)(NSError *) = [self.writeCallback copy];
        self.writeCallback = nil;
        writeCallback(error);
    });
}

#pragma mark - Characteristic Discovery

- (void)discoverCharacteristics:(nullable NSArray *)characteristics forService:(CBService *)service withBlock:(void (^)(NSArray *, NSError  *))characteristicCallback {
    _BERTY_ON_D_THREAD(^{
        self.characteristicCallback = characteristicCallback;
        [self.peripheral discoverCharacteristics:characteristics forService:service];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
    _BERTY_ON_D_THREAD(^{
        self.characteristicCallback(service.characteristics, error);
        self.characteristicCallback = nil;
    });
}

#pragma mark - Services Discovery

- (void)discoverServices:(NSArray *)serviceUUIDs withBlock:(void (^)(NSArray *, NSError *))serviceCallback {
    _BERTY_ON_D_THREAD(^{
        self.peripheral.delegate = self;
        self.serviceCallback = serviceCallback;
        [self.peripheral discoverServices:@[self.manager.serviceUUID]];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    _BERTY_ON_D_THREAD(^{
        self.serviceCallback(peripheral.services, error);
        self.serviceCallback = nil;
    });
}


@end
