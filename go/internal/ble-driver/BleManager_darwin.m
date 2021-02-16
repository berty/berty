// +build darwin
//
//  BleManager.m
//  ble
//
//  Created by sacha on 23/05/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <os/log.h>
#import "BleInterface_darwin.h"
#import "BleManager_darwin.h"
#import "BertyDevice_darwin.h"

@implementation BleManager

static NSString* const __nonnull SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6664";

static NSString* const __nonnull WRITER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

static NSString* const __nonnull PEER_ID_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

+ (CBUUID *)serviceUUID {
    return [CBUUID UUIDWithString:SERVICE_UUID];
}

+ (CBUUID *)peerUUID {
    return [CBUUID UUIDWithString:PEER_ID_UUID];
}

+ (CBUUID *)writerUUID {
    return [CBUUID UUIDWithString:WRITER_UUID];
}

// TODO: No need to check error on this?
- (instancetype __nonnull) initScannerAndAdvertiser {
    os_log_debug(OS_LOG_BLE, "peripheralManager: initScannerAndAdvertiser");
    self = [super init];

    if (self) {
        _cmEnable = FALSE;
        _pmEnable = FALSE;
        _dQueue = dispatch_queue_create("BleManager", DISPATCH_QUEUE_SERIAL);
        _bleOn = [[CountDownLatch alloc] init:2];
        _serviceAdded = [[CountDownLatch alloc] init:1];
        _bDevices = [[NSMutableArray alloc] init];

        _cManager = [[CBCentralManager alloc]
                        initWithDelegate:self
                        queue:dispatch_queue_create("CentralManager", DISPATCH_QUEUE_SERIAL)
                        options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:NO]}];

        _pManager = [[CBPeripheralManager alloc]
                        initWithDelegate:self
                        queue:dispatch_queue_create("PeripheralManager", DISPATCH_QUEUE_SERIAL)
                        options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:NO]}];

        [self initService];
        [self addService];
    }

    return self;
}

- (void)initService {
    os_log_debug(OS_LOG_BLE, "peripheralManager: initService");
    self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
    self.peerUUID = [CBUUID UUIDWithString:PEER_ID_UUID];
    self.writerUUID = [CBUUID UUIDWithString:WRITER_UUID];

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
                                          self.peerIDCharacteristic];
}

- (void)addService {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log_debug(OS_LOG_BLE, "peripheralManager: AddService: %{public}@", [self.serviceUUID UUIDString]);
        [self.bleOn await];
        if (self.cmEnable && self.pmEnable) {
            [self.pManager addService:self.bertyService];
            [self.serviceAdded await];
        }
    });
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(CBService *)service error:(nullable NSError *)error {
    if (error) {
        os_log_error(OS_LOG_BLE, "didAddService() error: %{public}@", [error localizedFailureReason]);
    }
    os_log_debug(OS_LOG_BLE, "peripheralManager: didAddService: %{public}@", [service.UUID UUIDString]);
    [self.serviceAdded countDown];
}

#pragma mark - go called functions

- (void)startScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && ![self.cManager isScanning]) {
            os_log_debug(OS_LOG_BLE, "startScanning()");
            NSDictionary *options = [NSDictionary
                                     dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                     CBCentralManagerScanOptionAllowDuplicatesKey, nil];
            [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
        }
    }
}

- (void)stopScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && [self.cManager isScanning]) {
            os_log_debug(OS_LOG_BLE, "stopScanning()");
            [self.cManager stopScan];
        }
    }
}

- (void)startAdvertising {
    @synchronized (self.pManager) {
        if (self.pmEnable && ![self.pManager isAdvertising]) {
            os_log_debug(OS_LOG_BLE, "startAdvertising()");
            [self.pManager startAdvertising:@{CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
        }
    }
}

- (void)stopAdvertising {
    @synchronized (self.pManager) {
        if (self.pmEnable && [self.pManager isAdvertising]) {
            os_log_debug(OS_LOG_BLE, "stoptAdvertising()");
            [self.pManager stopAdvertising];
        }
    }
}

- (void)cancelPeripheralConnection:(CBPeripheral *)peripheral {
    if (self.cmEnable) {
        BertyDevice *bDevice = [self findPeripheral:peripheral];
        
        if (bDevice != nil) {
            os_log_debug(OS_LOG_BLE, "cancelPeripheralConnection: device %{public}@", [bDevice.peripheral.identifier UUIDString]);
            bDevice.peripheral.delegate = nil;
            if (bDevice.peripheral.state == CBPeripheralStateConnecting || bDevice.peripheral.state == CBPeripheralStateConnected) {
                [self.cManager cancelPeripheralConnection:peripheral];
            }
            @synchronized (self.bDevices) {
                [self.bDevices removeObject:bDevice];
            }
        }
    }
}

- (void)cancelAllPeripheralConnections {
    os_log_debug(OS_LOG_BLE, "cancelAllPeripheralConnection()");
    if (self.cmEnable) {
        @synchronized (self.bDevices) {
            for (BertyDevice *bDevice in self.bDevices) {
                [self.cManager cancelPeripheralConnection:bDevice.peripheral];
            }
            [self.bDevices removeAllObjects];
        }
    }
}

#pragma mark - BertyDevice dict helper

- (BertyDevice *)findPeripheral:(CBPeripheral *)peripheral {
    BertyDevice *result = nil;
    
    @synchronized (self.bDevices) {
        for (BertyDevice *bDevice in self.bDevices) {
            if (bDevice.peripheral == peripheral) {
                result = bDevice;
                break;
            }
        }
    }

    return result;
}

- (BertyDevice *)findPeripheralFromPID:(NSString *)peerID {
    BertyDevice *result = nil;
    
    @synchronized (self.bDevices) {
        for (BertyDevice *bDevice in self.bDevices) {
            if ([bDevice.remotePeerID isEqualToString:peerID]) {
                result = bDevice;
                break;
            }
        }
    }

    return result;
}


- (BertyDevice *)findPeripheralFromIdentifier:(NSUUID *)identifier {
    BertyDevice *result = nil;
    NSString *id = [identifier UUIDString];
    
    @synchronized (self.bDevices) {
        for (BertyDevice *bDevice in self.bDevices) {
            if ([bDevice.identifier isEqual:id]) {
                result = bDevice;
                break;
            }
        }
    }

    return result;
}

#pragma mark - BleManager Connection Handler


#pragma mark - CentraManagerDelegate

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    _BERTY_ON_M_THREAD(^{
        BertyDevice *d = [self findPeripheral:peripheral];
        if (d == nil) {
            os_log_debug(OS_LOG_BLE, "didConnectPeripheral(): device %{public}@ not found", [peripheral.identifier UUIDString]);
            return ;
        }
        [d handleConnect:nil];
        os_log(OS_LOG_BLE, "didConnectPeripheral() %{public}@", [peripheral.identifier UUIDString]);
    });
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    _BERTY_ON_M_THREAD(^{
    os_log(OS_LOG_BLE, "didFailToConnectPeripheral() %{public}@", [peripheral.identifier UUIDString]);
    BertyDevice *bDevice = [self findPeripheral:peripheral];
    if (bDevice == nil) {
        os_log_debug(OS_LOG_BLE, "didFailToConnectPeripheral(): device %{public}@ not found", [peripheral.identifier UUIDString]);
        return ;
    }
    [bDevice handleConnect:error];
    });
}

- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI {
    _BERTY_ON_M_THREAD(^{

        BertyDevice *nDevice = [self findPeripheralFromIdentifier:peripheral.identifier];
        if (nDevice != nil) { // peripheral already known
            if (nDevice.peripheral != nil) { // peripheral already discovered
                return ;
            }
            // peripheral already known by CBPeripheralManager (advertising)
            // adding info given by CBCentralManager (scanning)
            [nDevice setPeripheral:peripheral central:self];
        } else {
            @synchronized (self.bDevices) {
                nDevice = [[BertyDevice alloc]initWithPeripheral:peripheral central:self];
                [self.bDevices addObject:nDevice];
                os_log_debug(OS_LOG_BLE, "didDiscoverPeripheral() device %{public}@ added to BleManager.bDevices",
                       [peripheral.identifier UUIDString]);
            }
        }
        [nDevice handshake];
    });
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    os_log(OS_LOG_BLE, "didDisconnectPeripheral() for device %{public}@ with error %{public}@", [peripheral.identifier UUIDString], error);
    BertyDevice *nDevice = [self findPeripheral:peripheral];
    @synchronized (self.bDevices) {
        [self.bDevices removeObject:nDevice];
    }
    BLEBridgeHandleLostPeer(nDevice.remotePeerID);
}

#pragma mark - State Management

- (void)peripheralManagerDidUpdateState:(nonnull CBPeripheralManager *)peripheral {
    NSString *stateString = nil;
    @synchronized (self.pManager) {
        self.pmEnable = FALSE;
    }

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
            @synchronized (self.pManager) {
                self.pmEnable = TRUE;
            }
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }
    os_log(OS_LOG_BLE, "peripheralManagerDidUpdateState: %{public}@", stateString);
    [self.bleOn countDown];
}

- (void)centralManagerDidUpdateState:(nonnull CBCentralManager *)central {
    NSString *stateString = nil;
    @synchronized (self.cManager) {
        self.cmEnable = FALSE;
    }

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
            @synchronized (self.cManager) {
                self.cmEnable = TRUE;
            }
            break;
        }
        default: {
            stateString = @"State unknown, update imminent.";
            break;
        }
    }
    os_log(OS_LOG_BLE, "centralManagerDidUpdateState: %{public}@", stateString);
    [self.bleOn countDown];
}

#pragma mark - write

- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    os_log_debug(OS_LOG_BLE, "didReceiveWriteRequests() writer called for device %{public}@", [requests[0].central.identifier UUIDString]);
    BOOL didHandshake;

    for (CBATTRequest *request in requests) {
        CBMutableCharacteristic *characteristic;
        // check if we hold a remote device of this type
        BertyDevice *remote = [self findPeripheralFromIdentifier:request.central.identifier];
        if (remote == nil) {
            os_log_debug(OS_LOG_BLE, "didReceiveWriteRequests(): peer unknown");
            @synchronized (self.bDevices) {
                remote = [[BertyDevice alloc]initWithIdentifier:[request.central.identifier UUIDString]];
                [self.bDevices addObject:remote];
                os_log_debug(OS_LOG_BLE, "didDiscoverPeripheral() device %{public}@ added to BleManager.bDevices",
                       [request.central.identifier UUIDString]);
            }
        }

        if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            os_log_debug(OS_LOG_BLE, "didReceiveWriteRequests: writer characteristic selected");
            // synchronised also for dataBuffer
            @synchronized (remote.didHandshakeLock) {
                didHandshake = remote.didHandshake;
                if (!didHandshake) {
                    os_log(OS_LOG_BLE, "didReceiveWriteRequests(): handshake not completed, adding data to cache: %{public}@", request.value);
                        [remote.dataBuffer enqObject:[request.value copy]];
                    [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorSuccess];
                    return ;
                }
            }
            characteristic = self.writerCharacteristic;
        }
        else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
            os_log_debug(OS_LOG_BLE, "didReceiveWriteRequests: peerID characteristic selected");
            @synchronized (remote.didHandshakeLock) {
                didHandshake = remote.didHandshake;
            }
            if (didHandshake) {
                os_log_error(OS_LOG_BLE, "didReceiveWriteRequests: receive peerID for device already connected");
                [self cancelPeripheralConnection:remote.peripheral];
                [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorWriteNotPermitted];
                return ;
            }
            characteristic = self.peerIDCharacteristic;
        } else {
            os_log_error(OS_LOG_BLE, "didReceiveWriteRequests(): characteristic not found");
            [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorRequestNotSupported];
            return ;
        }

        NSData *data = [request.value copy];
        
        //os_log(OS_LOG_BLE, "request ACTUALDATA=%{public}@ VAL=%{public}@ UUID=%{public}@ P=%p", data, request.value, request.characteristic.UUID, data);
        
        BOOL(^handler)(NSData *) = [remote.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];
        if (!handler(data)) {
            os_log_error(OS_LOG_BLE, "didReceiveWriteRequests: handle failed");
            [self cancelPeripheralConnection:remote.peripheral];
            [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorWriteNotPermitted];
        }
    }
    [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorSuccess];
}

@end
