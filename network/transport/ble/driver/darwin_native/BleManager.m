// +build darwin
//
//  BleManager.m
//  ble
//
//  Created by sacha on 23/05/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import "BleManager.h"
#import "BertyDevice.h"
#import <os/log.h>
#import "BleInterface.h"

@implementation BleManager

static NSString* const __nonnull SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6664";

static NSString* const __nonnull WRITER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

static NSString* const __nonnull MA_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

static NSString* const __nonnull PEER_ID_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

static NSString* const __nonnull EOD = @"EOD";

// TODO: No need to check error on this?
- (instancetype __nonnull) initScannerAndAdvertiser {
    os_log(OS_LOG_BLE, "peripheralManager: initScannerAndAdvertiser");
    self = [super init];

    if (self) {
        _dQueue = dispatch_queue_create("BleManager", DISPATCH_QUEUE_SERIAL);
        _statusCount = [[CountDownLatch alloc] init:2];
        _bDevices = [[NSMutableArray alloc] init];
        _knownPeripherals = [NSMutableArray array];

        _cManager = [[CBCentralManager alloc]
                        initWithDelegate:self
                        queue:dispatch_queue_create("CentralManager", DISPATCH_QUEUE_SERIAL)
                        options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];

        _pManager = [[CBPeripheralManager alloc]
                        initWithDelegate:self
                        queue:dispatch_queue_create("PeripheralManager", DISPATCH_QUEUE_SERIAL)
                        options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];

        [self initService];
        [self addService];
    }

    return self;
}

- (void)initService {
    os_log(OS_LOG_BLE, "peripheralManager: initService");
    self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
    self.maUUID = [CBUUID UUIDWithString:MA_UUID];
    self.peerUUID = [CBUUID UUIDWithString:PEER_ID_UUID];
    self.writerUUID = [CBUUID UUIDWithString:WRITER_UUID];

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

    self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID
                                                       primary:YES];
    self.bertyService.characteristics = @[self.writerCharacteristic,
                                          self.maCharacteristic,
                                          self.peerIDCharacteristic];
}

#pragma mark - go called functions

- (void)startScanning {
    if (![self.cManager isScanning]) {
        NSDictionary *options = [NSDictionary
                                 dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                 CBCentralManagerScanOptionAllowDuplicatesKey, nil];
        [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
    }
}

- (void)startAdvertising {
    if (![self.pManager isAdvertising]) {
        [self.pManager startAdvertising:@{CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
    }
}

- (void)addService {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log(OS_LOG_BLE, "peripheralManager: AddService: %@", [self.serviceUUID UUIDString]);
        [self.statusCount await];
        [self.pManager addService:self.bertyService];
    });
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(CBService *)service error:(nullable NSError *)error {
    if (error) {
        os_log(OS_LOG_BLE, "didAddService() error: %@", [error localizedFailureReason]);
    }
    os_log(OS_LOG_BLE, "peripheralManager: didAddService: %@", [service.UUID UUIDString]);
}

#pragma mark - BertyDevice dict helper

- (BertyDevice *)findPeripheral:(CBPeripheral *)peripheral {
    BertyDevice *result = nil;
    NSArray *devicesCopy = [NSArray arrayWithArray:self.bDevices];

    for (BertyDevice *bDevice in devicesCopy) {
        if (bDevice.peripheral == peripheral) {
            result = bDevice;
            break;
        }
    }

    return result;
}

#pragma mark - BleManager Connection Handler


#pragma mark - CentraManagerDelegate

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    _BERTY_ON_M_THREAD(^{
        os_log(OS_LOG_BLE, "didConnectPeripheral() %@", [peripheral.identifier UUIDString]);
        BertyDevice *d = [self findPeripheral:peripheral];
        [d handleConnect:nil];
    });
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    BertyDevice *d = [self findPeripheral:peripheral];
    [d handleConnect:error];
    os_log(OS_LOG_BLE, "didFailToConnectPeripheral() %@", [peripheral.identifier UUIDString]);
}

- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI {
    _BERTY_ON_M_THREAD(^{
        if ([self.knownPeripherals containsObject:peripheral] == FALSE) {
            [self.knownPeripherals addObject:peripheral];
            BertyDevice *nDevice = [[BertyDevice alloc]initWithPeripheral:peripheral central:self];
            @synchronized (self.bDevices) {
                    [self.bDevices addObject:nDevice];
            }
            os_log(OS_LOG_BLE, "didDiscoverPeripheral() device %@ added to BleManager.bDevices", [nDevice.peripheral.identifier UUIDString]);
            [nDevice handshake];
        }
    });
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    os_log(OS_LOG_BLE, "didDisconnectPeripheral() for device %@ with error %@", [peripheral.identifier UUIDString], error);
    BertyDevice *nDevice = [self findPeripheral:peripheral];
    @synchronized (self.bDevices) {
        [self.bDevices removeObject:nDevice];
    }
    @synchronized (self.knownPeripherals) {
        [self.knownPeripherals removeObject:peripheral];
    }
}

#pragma mark - State Management

- (void)peripheralManagerDidUpdateState:(nonnull CBPeripheralManager *)peripheral {
    NSString *stateString = nil;
    switch(peripheral.state)
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
            [self.statusCount countDown];
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }
    os_log(OS_LOG_BLE, "peripheralManagerDidUpdateState: %@", stateString);
}

- (void)centralManagerDidUpdateState:(nonnull CBCentralManager *)central {
    NSString *stateString = nil;

    switch(central.state)
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
            [self.statusCount countDown];
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }

    os_log(OS_LOG_BLE, "centralManagerDidUpdateState: %@", stateString);
}

- (BertyDevice *)findPeripheralFromIdentifier:(NSUUID *__nonnull)identifier {
    BertyDevice *result = nil;
    NSArray *devicesCopy = [NSArray arrayWithArray:self.bDevices];

    for (BertyDevice *bDevice in devicesCopy) {
        if ([bDevice.peripheral.identifier isEqual:identifier]) {
            result = bDevice;
            break;
        }
    }

    return result;
}

- (BertyDevice *)findPeripheralFromMa:(NSString *__nonnull)ma {
    BertyDevice *result = nil;
    NSArray *devicesCopy = [NSArray arrayWithArray:self.bDevices];

    for (BertyDevice *bDevice in devicesCopy) {
        if ([bDevice.remoteMa isEqual:ma]) {
            result = bDevice;
            break;
        }
    }

    return result;
}

#pragma mark - write

- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    for (CBATTRequest *request in requests) {
        // check if we hold a remote device of this type
        BertyDevice *remote = [self findPeripheralFromIdentifier:request.central.identifier];
        if (remote == nil) {
            os_log(OS_LOG_BLE, "didReceiveWriteRequests() failed peer unknown");
            // TODO: Add error HERE
            [peripheral respondToRequest:request withResult:CBATTErrorInsufficientAuthorization];
            return;
        }
        __block NSMutableData *data;
        @synchronized (remote.characteristicDatas) {
             data = [remote.characteristicDatas objectForKey:[request.characteristic.UUID UUIDString]];
        }
        remote.remoteCentral = request.central;
        // check if final data was received
        // NSLog(@"request ACTUALDATA=%@ VAL=%@ UUID=%@ P=%p", data, request.value, request.characteristic.UUID, data);
        if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            os_log(OS_LOG_BLE, "didReceiveWriteRequests() writer called for device %@", [remote.peripheral.identifier UUIDString]);
            void(^handler)(NSData *) = [remote.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];
            unsigned char zeroByte = 0;
            NSMutableData *tmpData = [NSMutableData dataWithData:request.value];
            [data appendBytes:&zeroByte length:1];
            handler(tmpData);
        } else if ([request.value isEqual:[EOD dataUsingEncoding:NSUTF8StringEncoding]]) {
            // TODO: say it was the end of the data and then call the right handler
            // retrieve handler
            void(^handler)(NSData *) = [remote.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];

            // adding 0 byte
            unsigned char zeroByte = 0;
            [data appendBytes:&zeroByte length:1];

            handler(data);

            // reset data
            [data setLength:0];
        } else {
            @synchronized (remote.characteristicDatas) {
                [data appendData:[request.value copy]];
            }
        }

        [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
    }
}

@end
