// +build darwin
//
//  main.m
//  kjh
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import "ble.h"
#include "_cgo_export.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

static BertyCentralManager *bcm;

void init(char *ma, char *peerID) {
    if (bcm == nil) {
        bcm = [[BertyCentralManager alloc] initWithMa:[NSString stringWithUTF8String:ma] AndPeerID:[NSString stringWithUTF8String:peerID]];
    }
}

int startDiscover() {
    if (![bcm.centralManager isScanning]) {
        [bcm startDiscover];
        return 1;
    }
    return 0;
}

int isDiscovering() {
    return (int)[bcm.centralManager isScanning];
}

int isAdvertising() {
    return (int)[bcm.peripheralManager isAdvertising];
}

int startAdvertising() {
    if (![bcm.peripheralManager isAdvertising]) {
        NSLog(@"Start advertising called");
        [bcm startAdvertising];
        return 1;
    }
    return 0;
}

NSData *Bytes2NSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }

void writeNSData(NSData *data, char *ma) {
    [bcm write:data forMa: [NSString stringWithUTF8String:ma]];
}

char *readPeerID(char *peerID) {
    return [bcm readPeerID:[NSString stringWithUTF8String:peerID]];
}

int dialPeer(char *peerID) {
    return [bcm dialPeer:[NSString stringWithUTF8String:peerID]];
}

@implementation BertyCentralManager

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6663";

NSString* const WRITER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const MA_READER_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

NSString* const PEER_ID_READER_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

NSString* const ACCEPT_UUID = @"6F110ECA-9FCC-4BB3-AB45-6F13565E2E34";

- (instancetype)initWithMa:(NSString *)ma AndPeerID:(NSString *)peerID {
    self = [super init];
    if (self) {
        self.serviceAdded = NO;
        self.ma = ma;
        self.peerID = peerID;
        self.discoveredDevice = [[NSMutableDictionary alloc] init];
        self.bertyDevices = [[NSMutableDictionary alloc] init];
        self.acceptSemaphore = [[NSMutableDictionary alloc] init];
        self.peerIDToPeripheral = [[NSMutableDictionary alloc] init];
        self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
        self.maUUID = [CBUUID UUIDWithString:MA_READER_UUID];
        self.peerUUID = [CBUUID UUIDWithString:PEER_ID_READER_UUID];
        self.writerUUID = [CBUUID UUIDWithString:WRITER_UUID];
        self.acceptUUID = [CBUUID UUIDWithString:ACCEPT_UUID];
        self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
        self.acceptCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.acceptUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsReadable | CBAttributePermissionsWriteable];
        self.maCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.maUUID properties:CBCharacteristicPropertyRead value:[ma dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.peerIDCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.peerUUID properties:CBCharacteristicPropertyRead value:[peerID dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.writerCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.writerUUID properties:CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsWriteable];

        self.bertyService.characteristics = @[self.writerCharacteristic, self.acceptCharacteristic, self.maCharacteristic, self.peerIDCharacteristic];
        self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0) options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0) options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.centralManager.delegate = self;
        self.peripheralManager.delegate = self;
    }

    NSLog(@"init finished %@", [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]);
    for (CBPeripheral *peripheral in [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]) {
        [self newDevice:peripheral];
    }

    return self;
}

- (void)checkDiscoverBertyDeviceCharacteristic:(BertyDevice *)device {
    for (CBCharacteristic *characteristic in [self getSvcForPeripheral:device.peripheral].characteristics) {
        if ([characteristic.UUID isEqual:self.maUUID] || [characteristic.UUID isEqual:self.peerUUID]) {
            [device.peripheral readValueForCharacteristic:characteristic];
        } else if ([characteristic.UUID isEqual:self.acceptUUID]) {
            dispatch_semaphore_signal(device.acceptSema);
        } else if ([characteristic.UUID isEqual:self.writerUUID]) {
            dispatch_semaphore_signal(device.writerSema);
        }
    }
}

- (void)checkUpdateValueCharacteristic:(CBCharacteristic *)charact ForDevice:(BertyDevice *)device {
    if ([charact.UUID isEqual:self.maUUID]) {
        device.ma = [[NSString alloc] initWithData:charact.value encoding:NSUTF8StringEncoding];
        dispatch_semaphore_signal(device.maSema);
    } else if ([charact.UUID isEqual:self.peerUUID]) {
        device.peerID = [[NSString alloc] initWithData:charact.value encoding:NSUTF8StringEncoding];
        dispatch_semaphore_signal(device.peerIDSema);
    }
}

- (BertyDevice *)newDevice:(CBPeripheral *)peripheral {
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    [peripheral setDelegate:self];

    if (device == nil) {
        device = [[BertyDevice alloc] initWithPeripheral:peripheral];
        @synchronized (self.bertyDevices) {
            [self.bertyDevices setObject:device forKey:[peripheral.identifier UUIDString]];
        }
    }

    [self.centralManager connectPeripheral:device.peripheral options:nil];

    // once device we have the device init dispact a block that will wait for the connection
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
        dispatch_semaphore_wait(device.connSema, DISPATCH_TIME_FOREVER);
        [peripheral discoverServices:@[self.serviceUUID]];
        dispatch_semaphore_wait(device.svcSema, DISPATCH_TIME_FOREVER);

        // once service is disco asked for charact retrieve
        [device.peripheral discoverCharacteristics:@[self.peerUUID, self.maUUID, self.writerUUID, self.acceptUUID]
                            forService:[self getSvcForPeripheral:device.peripheral]];
        dispatch_group_t group = dispatch_group_create();
        dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
            dispatch_semaphore_wait(device.writerSema, DISPATCH_TIME_FOREVER);
        });
        dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
            dispatch_semaphore_wait(device.acceptSema, DISPATCH_TIME_FOREVER);
        });
        dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
            dispatch_semaphore_wait(device.maSema, DISPATCH_TIME_FOREVER);
        });
        dispatch_group_async(group, dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
            dispatch_semaphore_wait(device.peerIDSema, DISPATCH_TIME_FOREVER);
        });
        dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
        NSLog(@"READY device %@", peripheral);
        AddToPeerStore([device.peerID UTF8String], [device.ma UTF8String]);
    });

    return device;
}

- (CBCharacteristic *)getWriterForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.writerUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
}

- (CBCharacteristic *)getAcceptForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.acceptUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
}

- (CBCharacteristic *)getPeerForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.peerUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
}

- (CBCharacteristic *)getMaForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.maUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
}

- (CBService *)getSvcForPeripheral:(CBPeripheral *)peripheral {
    return [self serviceWithUUID:self.serviceUUID forPeripheral:peripheral];
}

- (int)dialPeer:(NSString *)peerID {
    BertyDevice *device = nil;
    while (device == nil) {
        device = [self getDeviceFromPeerID:peerID];
        if (device != nil) {
            NSLog(@"device123 waaaaaaaait %@", device);
            // [device waitDeviceRdy];
            dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
            [self.acceptSemaphore setObject:semaphore forKey:device.peripheral.identifier];
            NSLog(@"device123Found %@", device);
            CBCharacteristic *charact = nil;
            while (charact == nil) {
                NSLog(@"device123Found");
                charact = [self getAcceptForPeripheral:device.peripheral];
            }
            [device.peripheral writeValue:[[NSData alloc] init] forCharacteristic:charact type:CBCharacteristicWriteWithResponse];
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
            dispatch_release(semaphore);
            return 1;
        }
    }
    return 0;
}

- (void)write:(NSData *)data forMa:(NSString *)ma {
    BertyDevice *device = [self getDeviceFromMa:ma];
    [device write:data];
}

- (void)sendToAcceptIncomingChannel:(BertyDevice*)device {
    sendAcceptToListenerForPeerID([self.ma UTF8String], [device.ma UTF8String], [device.peerID UTF8String]);
}

- (char *)readPeerID:(NSString *)ma {
    CBCharacteristic *characteristic = [self characteristicWithUUID:self.peerUUID
                                                    forServiceUUID:self.serviceUUID inPeripheral:[self.peerIDToPeripheral objectForKey:ma]];
    return [[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] UTF8String];
}

- (void)startAdvertising {
    NSLog(@"Start ADV");
    [self.peripheralManager startAdvertising:@{CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
}

- (void)startDiscover {
    NSLog(@"Start dicovering");
    [self.centralManager scanForPeripheralsWithServices: @[self.serviceUUID] options:@{CBCentralManagerScanOptionAllowDuplicatesKey:@NO}];
}

- (CBCharacteristic *)characteristicWithUUID:(CBUUID *)characteristicUUID forServiceUUID:(CBUUID *)serviceUUID inPeripheral:(CBPeripheral *)peripheral {
    for (CBService *service in peripheral.services) {
        if ([service.UUID isEqual:serviceUUID]) {
            for (CBCharacteristic *characteristic in service.characteristics) {
                if ([characteristic.UUID isEqual:characteristicUUID]) {
                    return characteristic;
                }
            }
        }
    }
    return nil;
}

- (CBService *)serviceWithUUID:(CBUUID *)serviceUUID forPeripheral:(CBPeripheral *)peripheral {
    for (CBService *service in peripheral.services) {
        if ([service.UUID isEqual:serviceUUID]) {
            return service;
        }
    }

    return nil;
}

- (void)centralManager:(CBCentralManager *)central
    didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"didConnectPeriheral: %@", [peripheral.identifier UUIDString]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    dispatch_semaphore_signal(device.connSema);
}

- (void)centralManager:(CBCentralManager *)central
    didDisconnectPeripheral:(CBPeripheral *)peripheral
                error:(NSError *)error {
    [self.bertyDevices removeObjectForKey:[peripheral.identifier UUIDString]];
    NSLog(@"didDisConnectPeriheral: %@", [peripheral.identifier UUIDString]);
}

- (void)centralManager:(CBCentralManager *)central
    didFailToConnectPeripheral:(CBPeripheral *)peripheral
                error:(NSError *)error {
    if (error) {
        NSLog(@"error %@", [error localizedFailureReason]);
    }
    NSLog(@"error connecting to: %@", [peripheral.identifier UUIDString]);
}

- (void)centralManager:(CBCentralManager *)central
    didDiscoverPeripheral:(CBPeripheral *)peripheral
    advertisementData:(NSDictionary<NSString *,id> *)advertisementData
                    RSSI:(NSNumber *)RSSI {
    if (![self getDeviceFromPeripheral:peripheral]) {
        NSLog(@"didDiscoverPeripheral: %@", [peripheral.identifier UUIDString]);
        [self newDevice:peripheral];
    }
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    NSString *stateString = nil;
    switch(self.centralManager.state)
    {
        case CBManagerStateResetting:
            break;
        case CBManagerStateUnsupported:
            break;
        case CBManagerStateUnauthorized:
            break;
        case CBManagerStatePoweredOff:
            stateString = @"Bluetooth is currently powered off.";
            break;
        case CBManagerStatePoweredOn:
            stateString = @"Bluetooth is currently powered on and available to use.";
            break;
        default:
            stateString = @"State unknown, update imminent.";
            break;
    }

    NSLog(@"Bluetooth State %@",stateString);
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverServices:(NSError *)error {
    NSLog(@"didDiscoverServices %@", [peripheral.identifier UUIDString]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    dispatch_semaphore_signal(device.svcSema);
}

- (void)peripheral:(CBPeripheral *)peripheral
    didDiscoverIncludedServicesForService:(CBService *)service
            error:(NSError *)error {
    NSLog(@"didDiscoverIncludedServicesForService");
}

- (void)peripheral:(CBPeripheral *)peripheral
    didDiscoverCharacteristicsForService:(CBService *)service
            error:(NSError *)error {
    if (error != nil) {
        NSLog(@"error discovering characteristic %@ %@", [error localizedFailureReason], [error localizedDescription]);
        return ;
    }
    [self checkDiscoverBertyDeviceCharacteristic:[self getDeviceFromPeripheral:peripheral]];
}

- (void)peripheral:(CBPeripheral *)peripheral
    didDiscoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic
            error:(NSError *)error {
    NSLog(@"didDiscoverDescriptorsForCharacteristic %@", [characteristic.UUID UUIDString]);
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
}

- (void)peripheral:(CBPeripheral *)peripheral
    didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic
            error:(NSError *)error {
    NSLog(@"didUpdateValueForCharacteristic %@ %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    [self checkUpdateValueCharacteristic:characteristic ForDevice:device];

    if (error) {
        NSLog(@"error: %@", [error localizedDescription]);
    }
}

- (void)peripheral:(CBPeripheral *)peripheral
    didUpdateValueForDescriptor:(CBDescriptor *)descriptor
            error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"didUpdateValueForDescriptor %@", [descriptor.UUID UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
    didWriteValueForCharacteristic:(CBCharacteristic *)characteristic
            error:(NSError *)error {
    if ([characteristic.UUID isEqual:self.acceptUUID]) {
        dispatch_semaphore_signal([self.acceptSemaphore objectForKey:peripheral.identifier]);
    }
    if ([characteristic.UUID isEqual:self.writerUUID]) {
        BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
        [device popToSend];
        [device checkAndWrite];
    }
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
}

- (void)peripheral:(CBPeripheral *)peripheral
    didWriteValueForDescriptor:(CBDescriptor *)descriptor
            error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"didWriteValueForDescriptor %@", descriptor.UUID);
}

- (void)peripheral:(CBPeripheral *)peripheral
    didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic
            error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"didUpdateNotificationStateForCharacteristic %@", [characteristic.UUID UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
        didReadRSSI:(NSNumber *)RSSI
            error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedDescription]);
    }
    NSLog(@"didReadRSSI");
}

- (void)peripheralDidUpdateName:(CBPeripheral *)peripheral {
    NSLog(@"peripheralDidUpdateName: %@", [peripheral.identifier UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
    didModifyServices:(NSArray<CBService *> *)invalidatedServices {
    NSLog(@"didModifyServices %@", invalidatedServices);
    for (CBService* svc in invalidatedServices) {
        if ([svc.UUID isEqual:self.serviceUUID]) {
            [self.centralManager cancelPeripheralConnection:peripheral];
        }
    }
}

- (void)peripheral:(CBPeripheral *)peripheral
    didOpenL2CAPChannel:(CBL2CAPChannel *)channel
            error:(NSError *)error {
    NSLog(@"didOpenL2CAPChannel");
}

- (void)peripheralIsReadyToSendWriteWithoutResponse:(CBPeripheral *)peripheral {
    NSLog(@"peripheralIsReadyToSendWriteWithoutResponse");
}

- (void)peripheralManagerDidUpdateState:(CBPeripheralManager *)peripheral {
    NSString *stateString = nil;
    switch(self.peripheralManager.state)
    {
        case CBManagerStateUnknown:
            stateString = @"CBManagerStateUnknown";
            break;
        case CBManagerStateResetting:
            stateString = @"CBManagerStateResetting";
            break;
        case CBManagerStateUnsupported:
            stateString = @"CBManagerStateUnsupported";
            break;
        case CBManagerStateUnauthorized:
            stateString = @"CBManagerStateUnauthorized";
            break;
        case CBManagerStatePoweredOff:
            stateString = @"CBManagerStatePoweredOff";
            break;
        case CBManagerStatePoweredOn:
            stateString = @"CBManagerStatePoweredOn";
            if (self.centralManager.state == CBManagerStatePoweredOn && self.serviceAdded == NO) {
                self.serviceAdded = YES;
                [self.peripheralManager addService:self.bertyService];
            }
            break;
        default:
            stateString = @"State unknown, update imminent.";
            break;
    }

    NSLog(@"State change peripheral manager: %@", stateString);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
        willRestoreState:(NSDictionary<NSString *,id> *)dict {
    NSLog(@"Will restore State invoked");
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
            didAddService:(CBService *)service
                    error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"service added: %@", [service.UUID UUIDString]);
    [self startAdvertising];
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral
                                        error:(NSError *)error {
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"peripheral start advertising %d", [peripheral isAdvertising]);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
                    central:(CBCentral *)central
    didSubscribeToCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"Subscription to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
                    central:(CBCentral *)central
    didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"Unsubscribed to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
    NSLog(@"peripheralManagerIsReadyToUpdateSubscribers");
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveReadRequest:(CBATTRequest *)request {
    NSLog(@"REICEVE READ REQ");
    if ([request.characteristic.UUID isEqual:self.maUUID]) {
        request.value = self.maCharacteristic.value;
        NSLog(@"REICEVE READ REQ ma");
        [self.peripheralManager respondToRequest:request withResult:CBATTErrorSuccess];
    } else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
        NSLog(@"REICEVE READ REQ peer");
        request.value = self.peerIDCharacteristic.value;
        [self.peripheralManager respondToRequest:request withResult:CBATTErrorSuccess];
    }
    else {
        NSLog(@"REICEVE READ REQ unknow");
    }

    [self.peripheralManager respondToRequest:request withResult:CBATTErrorInvalidHandle];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    // NSLog(@"REQUEST WRITE");
    for (CBATTRequest *request in requests) {
        if ([request.characteristic.UUID isEqual:self.acceptUUID]) {
            [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
            BertyDevice *device = nil;
            while (device == nil) {
                device = [self getDeviceFromUUID:[request.central.identifier UUIDString]];
            }
            // NSLog(@"request ACEEPT");
            // [device wai]
            // [self sendToAcceptIncomingChannel:device];
            [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        } else if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            BertyDevice *device = [self getDeviceFromUUID:[request.central.identifier UUIDString]];
            if (request.value != nil) {
                sendBytesToConn([device.ma UTF8String], [request.value bytes], (int)[request.value length]);
            }
            [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        }
        else {
            [peripheral respondToRequest:request withResult:CBATTErrorInsufficientAuthorization];
        }
    }
}

- (void)discoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"disco for charact %@", characteristic.UUID);
}

- (nullable BertyDevice*)getDeviceFromPeerID:(NSString*)peerID {
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    __block BertyDevice* device;
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        for (NSString *key in self.bertyDevices.allKeys) {
            device = [self.bertyDevices objectForKey:key];
            NSLog(@"FRom peer %@ %@", device.peerID, peerID);
            if (device.peerID != nil && [device.peerID isEqual:peerID]) {
                dispatch_semaphore_signal(semaphore);
                return ;
            }
            [NSThread sleepForTimeInterval:.5];
        }
        device = nil;
        dispatch_semaphore_signal(semaphore);
    });
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    dispatch_release(semaphore);
    return device;
}

- (nullable BertyDevice*)getDeviceFromMa:(NSString*)ma {
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    __block BertyDevice* device;
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        for (NSString *key in self.bertyDevices.allKeys) {
            device = [self.bertyDevices objectForKey:key];
            if (device.ma != nil && [device.ma isEqual:ma]) {
                dispatch_semaphore_signal(semaphore);
                return ;
            }
            [NSThread sleepForTimeInterval:.5];

        }
        device = nil;
        dispatch_semaphore_signal(semaphore);
    });
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    dispatch_release(semaphore);
    return device;
}

- (BertyDevice*)getDeviceFromPeripheral:(CBPeripheral*)peripheral {
    BertyDevice *device = [self.bertyDevices objectForKey:[peripheral.identifier UUIDString]];
    if (device != nil) {
        return device;
    }
    return nil;
}

- (nullable BertyDevice*)getDeviceFromUUID:(NSString*)key {
    BertyDevice *device = [self.bertyDevices objectForKey:key];
    if (device != nil) {
        return device;
    }
    return nil;
}

@end
