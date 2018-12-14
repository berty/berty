// +build darwin
//
//  BertyUtils.m
//  ble
//
//  Created by sacha on 29/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import "BertyUtils.h"
#import "ble.h"

@implementation BertyUtils

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6664";

NSString* const WRITER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const CLOSER_UUID = @"AD127A46-D065-4D72-B15A-EB2B3DA20561";

NSString* const MA_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

NSString* const PEER_ID_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

#pragma mark Singleton Methods

+ (BertyUtils *)sharedUtils {
    static BertyUtils *bertyUtils = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        bertyUtils = [[self alloc] init];
    });
    return bertyUtils;
}

+ (void)setMa:(NSString *)ma {
    NSLog(@"setMa: %@", ma);
    BertyUtils *me = [self sharedUtils];
    me.ma = ma;
}

+ (void)setPeerID:(NSString *)peerID {
    NSLog(@"setPeerID: %@", peerID);
    BertyUtils *me = [self sharedUtils];
    me.peerID = peerID;
}

+ (void)addDevice:(BertyDevice *)device {
    BertyUtils *me = [self sharedUtils];
    @synchronized (me.bertyDevices) {
        [me.bertyDevices setValue:device forKey:[device.peripheral.identifier UUIDString]];
    }
}

+ (void)newDevice:(CBPeripheral *)peripheral {
//    [peripheral setDelegate:self.peripheralDelegate];
//    BertyDevice *device = [[BertyDevice alloc] initWithPeripheral:peripheral withCentralManager:central];
//    [BertyUtils addDevice:device];
//    [central connectPeripheral:peripheral options:nil];
}

+ (void)removeDevice:(BertyDevice *)device {
    BertyUtils *me = [self sharedUtils];
    @synchronized (me.bertyDevices) {
        [me.bertyDevices removeObjectForKey:[device.peripheral.identifier UUIDString]];
    }
}

+ (Boolean)inDevices:(CBPeripheral *)peripheral {
    if ([self getDevice:peripheral]) {
        return YES;
    }
    return NO;
}

+ (Boolean)inDevicesWithPeerID:(NSString *)peerID {
    if ([self getDeviceFromPeerID:peerID]) {
        return YES;
    }
    return NO;
}

+ (Boolean)inDevicesWithMa:(NSString *)ma {
    if ([self getDeviceFromMa:ma]) {
        return YES;
    }
    return NO;
}

+ (nullable BertyDevice *)getDevice:(CBPeripheral *)peripheral {
    BertyUtils *me = [BertyUtils sharedUtils];
    @synchronized (me.bertyDevices) {
        return [me.bertyDevices objectForKey:[peripheral.identifier UUIDString]];
    }
}

+ (nullable BertyDevice *)getDeviceFromRequest:(CBATTRequest *)request {
    BertyUtils *me = [BertyUtils sharedUtils];
    @synchronized (me.bertyDevices) {
        return [me.bertyDevices objectForKey:[request.central.identifier UUIDString]];
    }
}

+ (nullable BertyDevice *)getDeviceFromMa:(NSString *)ma {
    BertyUtils *me = [BertyUtils sharedUtils];
    __block BertyDevice *bDevice = nil;
    @synchronized (me.bertyDevices) {
        for (NSString *key in me.bertyDevices.allKeys) {
            bDevice = [me.bertyDevices objectForKey:key];
            if (bDevice != nil && bDevice.ma != nil && ([bDevice.ma isEqual:ma])) {
                return bDevice;
            }
        }
    }
    return nil;
}

+ (nullable BertyDevice *)getDeviceFromPeerID:(NSString *)peerID {
    BertyUtils *me = [BertyUtils sharedUtils];
    __block BertyDevice *bDevice = nil;
    @synchronized (me.bertyDevices) {
        for (NSString *key in me.bertyDevices.allKeys) {
            bDevice = [me.bertyDevices objectForKey:key];
            NSLog(@"peerID: %@ device: %@", peerID, bDevice);
            if (bDevice != nil && bDevice.peerID != nil && ([bDevice.peerID isEqual:peerID])) {
                return bDevice;
            }
        }
    }
    return nil;
}

- (instancetype)init {
    self = [super init];
    self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
    self.maUUID = [CBUUID UUIDWithString:MA_UUID];
    self.peerUUID = [CBUUID UUIDWithString:PEER_ID_UUID];
    self.writerUUID = [CBUUID UUIDWithString:WRITER_UUID];
    self.closerUUID = [CBUUID UUIDWithString:CLOSER_UUID];

    self.maCharacteristic = [[CBMutableCharacteristic alloc]
                             initWithType:self.maUUID
                             properties:CBCharacteristicPropertyWrite
                             value:nil
                             permissions:CBAttributePermissionsWriteable];
    self.peerIDCharacteristic = [[CBMutableCharacteristic alloc]
                                 initWithType:self.peerUUID
                                 properties:CBCharacteristicPropertyWrite
                                 value:nil
                                 permissions:CBAttributePermissionsWriteable];
    self.writerCharacteristic = [[CBMutableCharacteristic alloc]
                                 initWithType:self.writerUUID
                                 properties:CBCharacteristicPropertyWrite
                                 value:nil
                                 permissions:CBAttributePermissionsWriteable];
    self.closerCharacteristic = [[CBMutableCharacteristic alloc]
                                 initWithType:self.closerUUID
                                 properties:CBCharacteristicPropertyWrite
                                 value:nil
                                 permissions:CBAttributePermissionsWriteable];

    self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID
                                                       primary:YES];
    self.bertyService.characteristics = @[self.closerCharacteristic,
                                          self.writerCharacteristic,
                                          self.maCharacteristic,
                                          self.peerIDCharacteristic];

    self.bertyDevices = [[NSMutableDictionary alloc] init];

    self.CentralIsOn = NO;
    self.PeripharalIsOn = NO;
    self.serviceAdded = NO;

    [self addObserver:self forKeyPath:@"CentralIsOn" options:0 context:nil];
    [self addObserver:self forKeyPath:@"PeripharalIsOn" options:0 context:nil];

    return self;
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    @synchronized (self) {
    }
}

+ (NSString *)arrayServiceToSting:(NSArray *)array {
    __block NSMutableString *str = [NSMutableString stringWithString:@""];
    [array enumerateObjectsUsingBlock:^(CBService * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if (idx > 0) {
            [str appendString:@":"];
        }
        [str appendString:[obj.UUID UUIDString]];
    }];
    return str;
}

+ (NSString *)arrayCharacteristicToSting:(NSArray *)array {
    __block NSMutableString *str = [NSMutableString stringWithString:@""];
    [array enumerateObjectsUsingBlock:^(CBCharacteristic * _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        if (idx > 0) {
            [str appendString:@":"];
        }
        [str appendString:[obj.UUID UUIDString]];
    }];
    return str;
}

@end
