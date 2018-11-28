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
#include <signal.h>

static BertyCentralManager *bcm;

void handleSigInt(int sig) {
    exit(-1);
}

void initSignalHandling() {
    signal(SIGINT, handleSigInt);
}

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

int dialPeer(char *peerID) {
    return [bcm dialPeer:[NSString stringWithUTF8String:peerID]];
}

void closeConn(char *ma) {
    [bcm close:[NSString stringWithUTF8String:ma]];
}

int isClosed(char *ma) {
    return [bcm isClosed:[NSString stringWithUTF8String:ma]];
}

@implementation BertyCentralManager

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6663";

NSString* const WRITER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const CLOSER_UUID = @"AD127A46-D065-4D72-B15A-EB2B3DA20561";

NSString* const IS_READY_UUID = @"D27DE0B5-2170-4C59-9C0B-750C760C74E6";

NSString* const MA_READER_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

NSString* const PEER_ID_READER_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

NSString* const ACCEPT_UUID = @"6F110ECA-9FCC-4BB3-AB45-6F13565E2E34";

- (instancetype)initWithMa:(NSString *)ma AndPeerID:(NSString *)peerID {
    self = [super init];
    if (self) {
        self.serviceAdded = NO;
        self.ma = ma;
        self.peerID = peerID;
        self.dispatch_queue = dispatch_queue_create("BertyCentralManager", DISPATCH_QUEUE_CONCURRENT);

        self.bertyDevices = [[NSMutableDictionary alloc] init];
        self.oldDevices = [[NSMutableDictionary alloc] init];
        self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
        self.maUUID = [CBUUID UUIDWithString:MA_READER_UUID];
        self.peerUUID = [CBUUID UUIDWithString:PEER_ID_READER_UUID];
        self.writerUUID = [CBUUID UUIDWithString:WRITER_UUID];
        self.acceptUUID = [CBUUID UUIDWithString:ACCEPT_UUID];
        self.closerUUID = [CBUUID UUIDWithString:CLOSER_UUID];
        self.isRdyUUID = [CBUUID UUIDWithString:IS_READY_UUID];
        self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
        self.acceptCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.acceptUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsReadable | CBAttributePermissionsWriteable];
        self.maCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.maUUID properties:CBCharacteristicPropertyRead value:[ma dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.peerIDCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.peerUUID properties:CBCharacteristicPropertyRead value:[peerID dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.writerCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.writerUUID properties:CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsWriteable];
        self.isRdyCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.isRdyUUID properties:CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsWriteable];
        self.closerCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.closerUUID properties:CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsWriteable];

        self.bertyService.characteristics = @[self.isRdyCharacteristic, self.closerCharacteristic, self.writerCharacteristic, self.acceptCharacteristic, self.maCharacteristic, self.peerIDCharacteristic];
        self.centralWaiter = dispatch_semaphore_create(0);

        self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_queue_create("BertyCentralManagerMMMM", DISPATCH_QUEUE_SERIAL) options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:dispatch_queue_create("BertyPeripheralManager", DISPATCH_QUEUE_SERIAL) options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.centralManager.delegate = self;
        self.peripheralManager.delegate = self;
        initSignalHandling();

        NSLog(@"init finished %@", [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]);
//        for (CBPeripheral *peripheral in [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]) {
//            dispatch_async(self.dispatch_queue, ^{
//                while (peripheral.state != CBPeripheralStateConnected) {
//                    NSLog(@"CONNECTING...");
//                    NSLog(@"%@ %d %d",[self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]], [self.peripheralManager isAdvertising], [self.centralManager isScanning]);
//
//                    [self.centralManager connectPeripheral:peripheral options:nil];
//                    [NSThread sleepForTimeInterval:1.0f];
//                }
//            });
//        }
    }

    return self;
}

- (void)dispatchCharacteristics:(CBCharacteristic *)characteristic forDevice:(BertyDevice *)device {
    if ([characteristic.UUID isEqual:self.acceptUUID]) {
        NSLog(@"acceptUUID latch down");
        [device.latchChar coundDown];
        device.accepter = characteristic;
    } else if ([characteristic.UUID isEqual:self.writerUUID]) {
        NSLog(@"writerUUID latch down");
        [device.latchChar coundDown];
        device.writer = characteristic;
    } else if ([characteristic.UUID isEqual:self.closerUUID]) {
        NSLog(@"closerUUID latch down");
        [device.latchChar coundDown];
        device.closer = characteristic;
    } else if ([characteristic.UUID isEqual:self.isRdyUUID]) {
        NSLog(@"isRdyUUID latch down");
        [device.latchChar coundDown];
        device.isRdy = characteristic;
    } else if ([characteristic.UUID isEqual:self.maUUID]) {
        NSLog(@"maUUID latch down");
        [device.latchChar coundDown];
        device.maChar = characteristic;
        [device.peripheral readValueForCharacteristic:characteristic];
    } else if ([characteristic.UUID isEqual:self.peerUUID]) {
        NSLog(@"peerID latch down");
        [device.latchChar coundDown];
        device.peerIDChar = characteristic;
        [device.peripheral readValueForCharacteristic:characteristic];
    }
}

- (void)checkDiscoverBertyDeviceCharacteristic:(BertyDevice *)device {
    NSArray *needToDiscover = @[self.maUUID, self.peerUUID, self.acceptUUID, self.writerUUID, self.closerUUID, self.isRdyUUID];
//    NSArray *toDiscover = [[NSArray alloc] init];
//    CBCharacteristic *characteristic;

//    for (CBUUID *uuid in needToDiscover) {
//        characteristic = [self characteristicWithUUID:uuid forServiceUUID:self.serviceUUID inPeripheral:device.peripheral];
//        if (characteristic == nil) {
//            toDiscover = [toDiscover arrayByAddingObject: uuid];
//        }
//    }

//    if (toDiscover.count > 0) {
        [device.peripheral discoverCharacteristics:needToDiscover
                            forService:device.svc];
//    }
//    for (NSUInteger i = needToDiscover.count - toDiscover.count; i < needToDiscover.count; i++) {
//        [device.latchChar coundDown];
//    }
}

- (void)checkUpdateValueCharacteristic:(CBCharacteristic *)charact forDevice:(BertyDevice *)device {
    NSLog(@"CHECK update");
    if ([charact.UUID isEqual:self.maUUID] && charact.value != nil) {
        NSLog(@"val ma");
        device.ma = [[NSString alloc] initWithData:charact.value encoding:NSUTF8StringEncoding];
        [device.latchRead coundDown];
    } else if ([charact.UUID isEqual:self.peerUUID] && charact.value != nil) {
        NSLog(@"val peer");
        device.peerID = [[NSString alloc] initWithData:charact.value encoding:NSUTF8StringEncoding];
        [device.latchRead coundDown];
    }
}
//
//- (void)checkConnectBertyDevice:(BertyDevice *)device {
//    NSLog(@"LA");
//    if (device.peripheral.state == CBPeripheralStateConnected) {
//        NSLog(@"LA1");
//        dispatch_async(self.dispatch_queue, ^{
//            dispatch_semaphore_signal(device.connSema);
//        });
//    } else {
//        NSLog(@"LA2");
//        dispatch_async(self.dispatch_queue, ^{
//            [self.centralManager connectPeripheral:device.peripheral options:nil];
//        });
//    }
//}
//
//- (void)checkSvcBertyDevice:(BertyDevice *)device {
//    CBService *service = [self getSvcForPeripheral:device.peripheral];
//    NSLog(@"service %@", service);
//    if (service != nil) {
//        dispatch_async(self.dispatch_queue, ^{
//            device.svc = service;
//            dispatch_semaphore_signal(device.svcSema);
//        });
//    } else {
//        [device.peripheral discoverServices:@[self.serviceUUID]];
//    }
//}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context
{
    if ([keyPath isEqualToString:@"state"]) {
        NSLog(@"OBJECT OBS %@", object);
        return ;
    }
    [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
}

- (BertyDevice *)newDevice:(CBPeripheral *)peripheral {
    NSLog(@"NEW DEVICE %@", peripheral);
    NSLog(@"NEW DI %@", [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    if (device != nil) {
        NSLog(@"NEW DEVICE2 %@", device);
        return device;
    }
    peripheral.delegate = self;
    [peripheral setDelegate:self];
    device = [[BertyDevice alloc] initWithPeripheral:peripheral withCentralManager:self.centralManager];
    NSLog(@"NEW DEVICE3 %@ %@", device, self.bertyDevices);
    for (NSString * key in self.bertyDevices) {
        BertyDevice *test = self.bertyDevices[key];
        NSLog(@"NEW DEVICE4 %@ %@", device.peripheral, test.peripheral);
    }
    @synchronized (self.bertyDevices) {
        [self.bertyDevices setObject:device forKey:[peripheral.identifier UUIDString]];
    }

    [peripheral addObserver:self forKeyPath:@"state" options:0 context:nil];
    return device;
}

- (int)dialPeer:(NSString *)ma {
    BertyDevice *device = [self getDeviceFromMa:ma];
    NSLog(@"DIAL PEER %@", ma);
    if (device == nil) {
        __block NSString *identifier;
        @synchronized (self.oldDevices) {
            identifier = [self.oldDevices objectForKey:ma];
        }
        NSArray<CBPeripheral *> *peripherals = [self.centralManager retrievePeripheralsWithIdentifiers:@[
                [CBUUID UUIDWithString:identifier]
            ]
        ];
        if (peripherals.count == 0) {
            return 0;
        }
        NSLog(@"TRYING TO MAKE NEW PEER %@", peripherals);
        device = [self newDevice:peripherals[0]];
    }
    if (device != nil) {
        NSLog(@"device123Found %@", device);
        // [device.peripheral writeValue:[[NSData alloc] init] forCharacteristic:device.accepter type:CBCharacteristicWriteWithResponse];
        // dispatch_semaphore_wait(device.acceptWaiterSema, DISPATCH_TIME_FOREVER);
        return 1;
    }

    return 0;
}

- (void)write:(NSData *)data forMa:(NSString *)ma {
    BertyDevice *device = [self getDeviceFromMa:ma];
    [device write:data];
}

- (int)isClosed:(NSString *)ma {
    BertyDevice *device = [self getDeviceFromMa:ma];
    if (device.peripheral.state == CBPeripheralStateConnected) {
        return 0;
    }
    return 1;
}

- (void)close:(NSString *)ma {
    BertyDevice *device = [self getDeviceFromMa:ma];
    NSLog(@"TRY CLOSING %@ %@", device, [self.centralManager retrieveConnectedPeripheralsWithServices:@[self.serviceUUID]]);
//    if (device != nil) {
////        device.closed = YES;
////        [device checkAndWrite];
//        [self removeBertyDevice:device];
//        dispatch_async(self.dispatch_queue, ^{
//            setConnClosed([device.ma UTF8String]);
//        });
//        dispatch_semaphore_wait(device.closerWaiterSema, dispatch_time(DISPATCH_TIME_NOW, (int64_t)(NSEC_PER_SEC * 10)));
//    }
}

- (void)sendToAcceptIncomingChannel:(BertyDevice*)device {
    sendAcceptToListenerForPeerID([self.ma UTF8String], [device.ma UTF8String], [device.peerID UTF8String]);
}

- (void)startAdvertising {
    NSLog(@"Start ADV");
    [self.peripheralManager startAdvertising:@{CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
}

- (void)startDiscover {
    NSLog(@"Start dicovering");
    [self.centralManager scanForPeripheralsWithServices: @[self.serviceUUID] options:@{CBCentralManagerScanOptionAllowDuplicatesKey:@YES}];
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

- (nullable CBService *)serviceWithUUID:(CBUUID *)serviceUUID forPeripheral:(CBPeripheral *)peripheral {
    for (CBService *service in peripheral.services) {
        if ([service.UUID isEqual:serviceUUID]) {
            return service;
        }
    }

    return nil;
}

- (void)centralManager:(CBCentralManager *)central
    didConnectPeripheral:(CBPeripheral *)peripheral {
    [self newDevice:peripheral];
    NSLog(@"didConnectPeripheral");
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    if (device == nil) {
        NSLog(@"didConnectPeripheral: %@", [peripheral.identifier UUIDString]);
        device = [self newDevice:peripheral];
    }
    dispatch_semaphore_signal(device.connSema);

    CBService *service = [self getSvcForPeripheral:device.peripheral];
    if (service != nil) {
        dispatch_semaphore_signal(device.svcSema);
        device.svc = service;
        [self checkDiscoverBertyDeviceCharacteristic:[self getDeviceFromPeripheral:peripheral]];
    } else {
        [device.peripheral discoverServices:@[self.serviceUUID]];
    }
    NSLog(@"didConnectPeriheral: %@ %@", [peripheral.identifier UUIDString], device);
}

- (void)centralManager:(CBCentralManager *)central
    didDisconnectPeripheral:(CBPeripheral *)peripheral
                error:(NSError *)error {
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    [self removeBertyDevice:device];
    dispatch_async(self.dispatch_queue, ^{
        setConnClosed([device.ma UTF8String]);
    });
    NSLog(@"didDisConnectPeriheral: %@ %@", [peripheral.identifier UUIDString], error);
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
    [peripheral setDelegate:self];
    if (![self getDeviceFromPeripheral:peripheral]) {
        NSLog(@"didDiscoverPeripheral: %@", [peripheral.identifier UUIDString]);
        [self newDevice:peripheral];
    }
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    NSString *stateString = nil;
    switch(self.centralManager.state)
    {
        case CBManagerStateResetting: {
            break;
        }
        case CBManagerStateUnsupported: {
            break;
        }
        case CBManagerStateUnauthorized: {
            break;
        }
        case CBManagerStatePoweredOff: {
            stateString = @"Bluetooth is currently powered off.";
            break;
        }
        case CBManagerStatePoweredOn: {
            stateString = @"Bluetooth is currently powered on and available to use.";
            dispatch_async(self.dispatch_queue, ^{
                dispatch_semaphore_signal(self.centralWaiter);
            });
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }

    NSLog(@"Bluetooth State %@",stateString);
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverServices:(NSError *)error {
    NSLog(@"didDiscoverServices %@", [peripheral.identifier UUIDString]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    if (device == nil) {
        NSLog(@"ERROR DISCOVERING SERVICE NO DEVICE");
    } else {
        CBService *service = [self getSvcForPeripheral:device.peripheral];
        if (service == nil) {
            NSLog(@"ERROR DISCOVERING SERVICE NO SELF SERVICE");
        } else {
            dispatch_semaphore_signal(device.svcSema);
            device.svc = service;
            [self checkDiscoverBertyDeviceCharacteristic:[self getDeviceFromPeripheral:peripheral]];
        }
    }
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
    NSLog(@"didDiscoverCharacteristicsForService %lli", [service.characteristics count]);
    for (CBCharacteristic *characteristic in service.characteristics) {
        [self dispatchCharacteristics:characteristic forDevice:[self getDeviceFromPeripheral:peripheral]];
    }
//    [self checkDiscoverBertyDeviceCharacteristic:[self getDeviceFromPeripheral:peripheral]];
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
//    NSLog(@"didUpdateValueForCharacteristic %@ %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString]);
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    NSLog(@"didUpdateValueForCharacteristic %@ %@ %@", [peripheral.identifier UUIDString], [characteristic.UUID UUIDString], device);
    if (device != nil) {
        [self checkUpdateValueCharacteristic:characteristic forDevice:device];
    }

    if (error) {
        NSLog(@"error: %@ %@",error, [error localizedDescription]);
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
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    if (device == nil) {
        NSLog(@"TRYING TO MAKE NEW PEER NO HERe");

    }
    if (error) {
        NSLog(@"error: %@ %@", [error localizedFailureReason], [error userInfo]);
        if ([characteristic.UUID isEqual:self.isRdyUUID]) {
            [device writeIsRdy];
        }
        return;
    }
    if ([characteristic.UUID isEqual:self.closerUUID]) {
        dispatch_semaphore_signal(device.closerWaiterSema);
    } else if ([characteristic.UUID isEqual:self.acceptUUID]) {
        dispatch_semaphore_signal(device.acceptWaiterSema);
    } else if ([characteristic.UUID isEqual:self.writerUUID]) {
        [device popToSend];
        [device checkAndWrite];
    } else if ([characteristic.UUID isEqual:self.isRdyUUID]) {
        [device.latchRdy coundDown];
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
            BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
            [self removeBertyDevice:device];
            setConnClosed([device.ma UTF8String]);
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
        case CBManagerStateUnknown: {
            stateString = @"CBManagerStateUnknown";
            break;
        }
        case CBManagerStateResetting: {
            stateString = @"CBManagerStateResetting";
            break;
        }
        case CBManagerStateUnsupported: {
            stateString = @"CBManagerStateUnsupported";
            break;
        }
        case CBManagerStateUnauthorized: {
            stateString = @"CBManagerStateUnauthorized";
            break;
        }
        case CBManagerStatePoweredOff: {
            stateString = @"CBManagerStatePoweredOff";
            break;
        }
        case CBManagerStatePoweredOn: {
            stateString = @"CBManagerStatePoweredOn";
            if (self.serviceAdded == NO) {
                dispatch_async(self.dispatch_queue, ^{
                    dispatch_semaphore_wait(self.centralWaiter, DISPATCH_TIME_FOREVER);
                    self.serviceAdded = YES;
                    [self.peripheralManager addService:self.bertyService];
                });
            }
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }

    NSLog(@"State change peripheral manager: %@", stateString);
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
    didReceiveReadRequest:(CBATTRequest *)request {
    if ([request.characteristic.UUID isEqual:self.maUUID]) {
        request.value = self.maCharacteristic.value;
        [self.peripheralManager respondToRequest:request withResult:CBATTErrorSuccess];
    } else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
        request.value = self.peerIDCharacteristic.value;
        [self.peripheralManager respondToRequest:request withResult:CBATTErrorSuccess];
    }
    else {
        NSLog(@"REICEVE READ REQ unknow");
    }

    [self.peripheralManager respondToRequest:request withResult:CBATTErrorInvalidHandle];
}

- (void)acceptRequest:(CBPeripheralManager *)peripheral
            req:(CBATTRequest *)request forDevice:(BertyDevice *)device {
    [self dispatchSuccess:peripheral forRequest:request];
}

- (void)writeRequest:(CBPeripheralManager *)peripheral
            req:(CBATTRequest *)request forDevice:(BertyDevice *)device {
    [self dispatchSuccess:peripheral forRequest:request];
    if (request.value != nil) {
        sendBytesToConn([device.ma UTF8String], [request.value bytes], (int)[request.value length]);
    }
}

- (void)closeRequest:(CBPeripheralManager *)peripheral
            req:(CBATTRequest *)request forDevice:(BertyDevice *)device {
    [self dispatchSuccess:peripheral forRequest:request];
    device.closedSend = YES;
    device.closed = YES;
    [self removeBertyDevice:device];
    dispatch_async(self.dispatch_queue, ^{
        setConnClosed([device.ma UTF8String]);
    });
}

- (void)isRdyRequest:(CBPeripheralManager *)peripheral
            req:(CBATTRequest *)request forDevice:(BertyDevice *)device {
    [self dispatchSuccess:peripheral forRequest:request];
    [device.latchRdy coundDown];
}

- (void)dispatchSuccess:(CBPeripheralManager *)peripheral forRequest:(CBATTRequest *)request {
    dispatch_async(self.dispatch_queue, ^{
        [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
    });
}

- (void)peripheralManager:(CBPeripheralManager *)pm
    didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    NSLog(@"didReceiveWriteRequests");
    for (CBATTRequest *request in requests) {
        BertyDevice *device = [self
            getDeviceFromUUID:[request.central.identifier UUIDString]];
        if (device == nil) {
            dispatch_async(self.dispatch_queue, ^{
                [pm respondToRequest:request withResult:CBATTErrorRequestNotSupported];
                [self startDiscover];
            });
            return;
//            NSArray<CBPeripheral *> *peripherals = [self.centralManager retrievePeripheralsWithIdentifiers:@[request.central.identifier]];
//            if (peripherals.count == 0) {
//                continue;
//            }
//            NSLog(@"TRYING TO MAKE NEW PEER4123 %@", peripherals);
//
//            CBPeripheral *periph =peripherals[0];
//            for (CBService *svc in periph.services) {
//                NSLog(@"KNOWN CHAR FOR SVC %@ FOR DEVICE %@", [svc.UUID UUIDString],[periph.identifier UUIDString]);
//                for (CBCharacteristic *cha in svc.characteristics) {
//                    NSLog(@"KNOWN CHAR FOR SVC %@ FOR DEVICE %@ FOR CHAR %@", [svc.UUID UUIDString], [periph.identifier UUIDString], [cha.UUID UUIDString]);
//                }
//            }
//
//            return;
//            [self.centralManager connectPeripheral:peripherals[0] options:nil];
//            device = [self newDevice:peripherals[0]];
        }

        if ([request.characteristic.UUID isEqual:self.acceptUUID]) {
            NSLog(@"ACCEPT WRITE");
            [self acceptRequest:pm req:request forDevice:device];
        } else if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            NSLog(@"WRTIER WRITE");
            [self writeRequest:pm req:request forDevice:device];
        } else if ([request.characteristic.UUID isEqual:self.closerUUID]) {
            NSLog(@"CLOSER WRITE");
            [self closeRequest:pm req:request forDevice:device];
        } else if ([request.characteristic.UUID isEqual:self.isRdyUUID]) {
            NSLog(@"ISRDY WRITE %@", device);
            [self isRdyRequest:pm req:request forDevice:device];
            NSLog(@"ISRDY WRITEFICNISH %@", device);
        } else {
            [pm respondToRequest:request withResult:CBATTErrorInsufficientAuthorization];
        }
    }
}

- (void)discoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"disco for charact %@", characteristic.UUID);
}

- (void)removeBertyDevice:(BertyDevice *)device {
    @synchronized (self.bertyDevices) {
        if ([self.bertyDevices objectForKey:[device.peripheral.identifier UUIDString]]) {
            [self.bertyDevices removeObjectForKey:[device.peripheral.identifier UUIDString]];
        }
    }
    @synchronized (self.oldDevices) {
        if (device.ma != nil) {
            [self.oldDevices setObject:[device.peripheral.identifier UUIDString] forKey:device.ma];
        }
    }
}

- (nullable BertyDevice*)getDeviceFromPeerID:(NSString*)peerID {
    __block BertyDevice* device;
    @synchronized (self.bertyDevices) {
        for (NSString *key in self.bertyDevices.allKeys) {
            device = [self.bertyDevices objectForKey:key];
            if (device.peerID != nil && ([device.peerID isEqual:peerID])) {
                return device;
            }
        }
    }
    return nil;
}

- (nullable BertyDevice*)getDeviceFromMa:(NSString*)ma {
    __block BertyDevice* device;
    @synchronized (self.bertyDevices) {
        for (NSString *key in self.bertyDevices.allKeys) {
            device = [self.bertyDevices objectForKey:key];
            if (device.ma != nil && [device.ma isEqual:ma]) {
                return device;
            }
        }
    }
    return nil;
}

- (nullable BertyDevice*)getDeviceFromPeripheral:(CBPeripheral*)peripheral {
    __block BertyDevice *device = nil;
    @synchronized (self.bertyDevices) {
        device = [self.bertyDevices objectForKey:[peripheral.identifier UUIDString]];
    }
    if (device != nil) {
        return device;
    }
    return nil;
}

- (nullable BertyDevice*)getDeviceFromUUID:(NSString*)key {
    __block BertyDevice *device = nil;
    @synchronized (self.bertyDevices) {
        device = [self.bertyDevices objectForKey:key];
    }

    return device;
}

- (CBCharacteristic *)getIsRdyForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.isRdyUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
}

- (CBCharacteristic *)getCloserForPeripheral:(CBPeripheral *)peripheral {
    return [self characteristicWithUUID:self.closerUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral];
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

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
    NSLog(@"peripheralManagerIsReadyToUpdateSubscribers");
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

- (void)peripheralManager:(CBPeripheralManager *)peripheral
        willRestoreState:(NSDictionary<NSString *,id> *)dict {
    NSLog(@"Will restore State invoked");
}

@end
