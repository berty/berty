// +build darwin
//
//  BertyDevice.m
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import "BertyDevice.h"
#import <os/log.h>
#import "BleInterface.h"

extern unsigned short handlePeerFound(char *, char *);
extern void receiveFromDevice(char *, void *, int);

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
    self = [super init];

    if (self) {
        self.remoteCentral = nil;
        self.peripheral = peripheral;
        peripheral.delegate = self;
        self.manager = manager;
        self.maSend = FALSE;
        self.peerIDSend = FALSE;
        self.maRecv = FALSE;
        self.peerIDRecv = FALSE;

        self.dQueue = dispatch_queue_create([[NSString stringWithFormat:@"%@%@",
                                         @"BertyDevice-",
                                         [peripheral.identifier UUIDString]]
                                               cStringUsingEncoding:NSASCIIStringEncoding],
                                        DISPATCH_QUEUE_SERIAL);

        self.writeQueue = dispatch_queue_create([[NSString stringWithFormat:@"%@%@",
                                              @"WriteBertyDevice-",
                                              [peripheral.identifier UUIDString]]
                                             cStringUsingEncoding:NSASCIIStringEncoding],
                                            DISPATCH_QUEUE_SERIAL);

        void (^maHandler)(NSData *data) = ^(NSData *data) {
            [self handleMa:data];
        };

        void (^peerIDHandler)(NSData *data) = ^(NSData *data) {
            [self handlePeerID:data];
        };

        void (^writeHandler)(NSData *data) = ^(NSData *data) {
            receiveFromDevice([self.remoteMa UTF8String], [data bytes], (int)[data length]);
        };

        self.characteristicHandlers = @{
                                        [manager.writerUUID UUIDString]: [writeHandler copy],
                                        [manager.maUUID UUIDString]: [maHandler copy],
                                        [manager.peerUUID UUIDString]: [peerIDHandler copy],
                                        };

        self.characteristicDatas = @{
                                     [manager.writerUUID UUIDString]: [NSMutableData data],
                                     [manager.maUUID UUIDString]: [NSMutableData data],
                                     [manager.peerUUID UUIDString]: [NSMutableData data],
                                     };
    }

    return self;
}

- (void)handleMa:(NSData *)maData {
    NSString *remoteMa = [NSString stringWithUTF8String:[maData bytes]];
    os_log(OS_LOG_BLE, "handlePeerID() device %@ with current Ma %@, new Ma %@", [self.peripheral.identifier UUIDString], self.remoteMa, remoteMa);
    self.remoteMa = [NSString stringWithUTF8String:[maData bytes]];
    self.maRecv = TRUE;
    [self checkAndHandleFoundPeer];
}

- (void)handlePeerID:(NSData *)peerIDData {
    NSString *remotePeerID = [NSString stringWithUTF8String:[peerIDData bytes]];
    os_log(OS_LOG_BLE, "handlePeerID() device %@ with current peerID %@, new peerID %@", [self.peripheral.identifier UUIDString], self.remotePeerID, remotePeerID);
    self.remotePeerID = remotePeerID;
    self.peerIDRecv = TRUE;
    [self checkAndHandleFoundPeer];
}

- (void)checkAndHandleFoundPeer {
    if (self.maSend == TRUE && self.peerIDSend == TRUE &&
        self.maRecv == TRUE && self.peerIDRecv == TRUE) {
        os_log(OS_LOG_BLE, "checkAndHandleFoundPeer() handling found peer %@", [self.peripheral.identifier UUIDString]);
        if (!handlePeerFound([self.remotePeerID UTF8String], [self.remoteMa UTF8String])) {
          os_log_error(OS_LOG_BLE, "checkAndHandleFoundPeer() failed: golang can't handle new peer %@", [self.peripheral.identifier UUIDString]);
          //TODO: Disconnect device
        }
    }
}

- (void)handshake {
    dispatch_async(self.dQueue, ^{
        [self connectWithOptions:nil
            withBlock:^(BertyDevice* device, NSError *error){
            if (error) {
                os_log_error(OS_LOG_BLE, "handshake() device %@ connection failed %@", [device.peripheral.identifier UUIDString], error);
                return;
            }
            os_log(OS_LOG_BLE, "handshake() device %@ connection succeed", [device.peripheral.identifier UUIDString]);
            [self discoverServices:@[self.manager.serviceUUID] withBlock:^(NSArray *services, NSError *error) {
                if (error) {
                    os_log_error(OS_LOG_BLE, "handshake() device %@ discover service failed %@", [device.peripheral.identifier UUIDString], error);
                    return;
                }
                os_log(OS_LOG_BLE, "handshake() device %@ service discover succeed", [device.peripheral.identifier UUIDString]);
                CBService *service = getService(services, [self.manager.serviceUUID UUIDString]);
                if (service == nil) {
                    return;
                }
                [self discoverCharacteristics:@[self.manager.maUUID, self.manager.peerUUID, self.manager.writerUUID,] forService:service withBlock:^(NSArray *chars, NSError *error) {
                    if (error) {
                        os_log_error(OS_LOG_BLE, "handshake() device %@ discover characteristic failed %@", [device.peripheral.identifier UUIDString], error);
                        return;
                    }
                    os_log(OS_LOG_BLE, "handshake() device %@ discover characteristic succeed", [device.peripheral.identifier UUIDString]);
                    for (CBCharacteristic *chr in chars) {
                        if ([chr.UUID isEqual:self.manager.maUUID]) {
                            self.ma = chr;
                        } else if ([chr.UUID isEqual:self.manager.peerUUID]) {
                            self.peerID = chr;
                        } else if ([chr.UUID isEqual:self.manager.writerUUID]) {
                            self.writer = chr;
                        }
                    }

                    [self writeToCharacteristic:[[self.manager.ma dataUsingEncoding:NSUTF8StringEncoding] mutableCopy] forCharacteristic:self.ma withEOD:TRUE andBlock:^(NSError *error) {
                        if (error) {
                            os_log_error(OS_LOG_BLE, "handshake() device %@ write Ma failed %@", [device.peripheral.identifier UUIDString], error);
                            return;
                        }
                        os_log(OS_LOG_BLE, "handshake() device %@ write Ma succeed", [device.peripheral.identifier UUIDString]);
                        self.maSend = TRUE;
                        [self writeToCharacteristic:[[self.manager.peerID dataUsingEncoding:NSUTF8StringEncoding] mutableCopy] forCharacteristic:self.peerID withEOD:TRUE andBlock:^(NSError *error) {
                            if (error) {
                                os_log_error(OS_LOG_BLE, "handshake() device %@ write peerID failed %@", [device.peripheral.identifier UUIDString], error);
                                return;
                            }
                            os_log(OS_LOG_BLE, "handshake() device %@ write peerID succeed", [device.peripheral.identifier UUIDString]);

                            self.peerIDSend = TRUE;
                            [self checkAndHandleFoundPeer];
                        }];
                    }];
                }];
            }];
        }];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices {
    CBService *service = getService(invalidatedServices, [self.manager.serviceUUID UUIDString]);
    if (service == nil) {
        return;
    }
    os_log(OS_LOG_BLE, "didModifyServices() with invalidated %@", invalidatedServices);
    self.maSend = FALSE;
    self.peerIDSend = FALSE;
    self.maRecv = FALSE;
    self.peerIDRecv = FALSE;

    [self.manager.cManager cancelPeripheralConnection:peripheral];
    // TODO: advertise libp2p that it fail
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
        NSData *toSend = nil;
        __block NSError *blockError = nil;

        self.remainingData = data;
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);

        while (self.remainingData.length > 0) {
            toSend = [self getDataToSend];

            [self writeValue:toSend forCharacteristic:characteristic withBlock:^(NSError *error){
                blockError = error;
                dispatch_semaphore_signal(sema);
            }];
            dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);

            if (blockError != nil) {
                writeCallback(blockError);
            }
        }
        if (eod) {
            [self writeValue:[@"EOD" dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:characteristic withBlock:^(NSError *error){
                blockError = error;
                dispatch_semaphore_signal(sema);
            }];
            dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
        }
        dispatch_release(sema);
        writeCallback(nil);
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
        self.writeCallback(error);
        self.writeCallback = nil;
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
