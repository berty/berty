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
#import "PeerManager.h"
#import "ConnectedPeer.h"
#import <objC/runtime.h>

@implementation BleManager
static NSString* const __nonnull SERVICE_UUID = @"00004240-0000-1000-8000-00805F9B34FB";

static NSString* const __nonnull WRITER_UUID = @"00004242-0000-1000-8000-00805F9B34FB";

static NSString* const __nonnull PEER_ID_UUID = @"00004241-0000-1000-8000-00805F9B34FB";

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
    os_log_debug(OS_LOG_BLE, "🟢 peripheralManager: initScannerAndAdvertiser");
    self = [super init];

    if (self) {
        _cmEnable = FALSE;
        _pmEnable = FALSE;
        _scannerTimer = nil;
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
    os_log_debug(OS_LOG_BLE, "🟢 peripheralManager: initService");
    _scanning = FALSE;
    _serviceUUID = [[CBUUID UUIDWithString:SERVICE_UUID] retain];
    _peerUUID = [[CBUUID UUIDWithString:PEER_ID_UUID] retain];
    _writerUUID = [[CBUUID UUIDWithString:WRITER_UUID] retain];

    _peerIDCharacteristic = [[CBMutableCharacteristic alloc]
                                     initWithType:self.peerUUID
                                     properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyWrite
                                     value:nil
                                     permissions:CBAttributePermissionsReadable | CBAttributePermissionsWriteable];
    
    _writerCharacteristic = [[CBMutableCharacteristic alloc]
                                 initWithType:self.writerUUID
                                 properties:CBCharacteristicPropertyWrite
                                 value:nil
                                 permissions:CBAttributePermissionsWriteable];

    _bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID
                                                       primary:YES];
    
    _bertyService.characteristics = [@[self.writerCharacteristic,
                                          self.peerIDCharacteristic] retain];
}

- (void)dealloc {
    [_bleOn release];
    [_serviceAdded release];
    [_bDevices release];
    [_cManager release];
    [_pManager release];
    [_serviceUUID release];
    [_peerUUID release];
    [_writerUUID release];
    [_peerIDCharacteristic release];
    [_writerCharacteristic release];
    [_bertyService.characteristics release];
    [_bertyService release];
    
    [super dealloc];
}

- (void)addService {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log_debug(OS_LOG_BLE, "🟢 peripheralManager: AddService: %{public}@", [self.serviceUUID UUIDString]);
        [self.bleOn await];
        if (self.cmEnable && self.pmEnable) {
            [self.pManager addService:self.bertyService];
            [self.serviceAdded await];
        }
    });
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(CBService *)service error:(nullable NSError *)error {
    if (error) {
        os_log_error(OS_LOG_BLE, "🔴 didAddService() error: %{public}@", [error localizedFailureReason]);
    }
    os_log_debug(OS_LOG_BLE, "🟢 peripheralManager: didAddService: %{public}@", [service.UUID UUIDString]);
    [self.serviceAdded countDown];
}


#pragma mark - go called functions

- (void)startScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && !self.scanning) {
            if (self.localPID != nil) {
                os_log_debug(OS_LOG_BLE, "🟢 startScanning()");
                NSDictionary *options = [NSDictionary
                                        dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                        CBCentralManagerScanOptionAllowDuplicatesKey, nil];
                [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
                self.scanning = TRUE;

                dispatch_async(dispatch_get_main_queue(), ^(void){
                    self.scannerTimer = [NSTimer scheduledTimerWithTimeInterval:12.0 target:self selector:@selector(toggleScanner:) userInfo:nil repeats:YES];
                });
            }  else {
                os_log_error(OS_LOG_BLE, "startScanning error: localPID is null");
            }
        }
    }
}

- (void)toggleScanner:(NSTimer*)timer {
    if ([self.cManager isScanning]) {
        NSLog(@"toggleScanner: disable scanner");
        [self.cManager stopScan];
    } else {
        NSLog(@"toggleScanner: enable scanner");
        NSDictionary *options = [NSDictionary
                                 dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                 CBCentralManagerScanOptionAllowDuplicatesKey, nil];
        [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
    }
    
}

- (void)stopScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && self.scanning) {
            NSLog(@"🟢 stopScanning called");
            dispatch_async(dispatch_get_main_queue(), ^{
                if (self.scannerTimer != nil) {
                    if ([self.scannerTimer isValid]) {
                        [self.scannerTimer invalidate];
                    }
                    self.scannerTimer = nil;
                }

                if ([self.cManager isScanning]) {
                    [self.cManager stopScan];
                }

                self.scanning = FALSE;
            });
        }
    }
}

- (void)startAdvertising {
    @synchronized (self.pManager) {
        if (self.pmEnable && ![self.pManager isAdvertising]) {
            if (self.localPID != nil) {
                NSString *randId = [self.localPID substringWithRange:NSMakeRange([self.localPID length] - 4, 4)];
                os_log_debug(OS_LOG_BLE, "🟢 startAdvertising() name=%{public}@", randId);
                
                // publish l2cap channel
                self.psm = 0;
                // TODO: fix l2cap
                //[self.pManager publishL2CAPChannelWithEncryption:false];
                
                [self.pManager startAdvertising:@{ CBAdvertisementDataLocalNameKey:randId, CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
            } else {
                os_log_error(OS_LOG_BLE, "startAdvertising error: localPID is null");
            }
        }
    }
}

- (void)stopAdvertising {
    @synchronized (self.pManager) {
        if (self.pmEnable && [self.pManager isAdvertising]) {
            os_log_debug(OS_LOG_BLE, "🟢 stopAdvertising()");
            if (self.psm != 0) {
                [self.pManager unpublishL2CAPChannel:self.psm];
            }
            [self.pManager stopAdvertising];
        }
    }
}

// client side handle disconnection
// else destroy object for server side
- (void)disconnect:(BertyDevice *__nonnull)device {
    if (device.peripheral != nil && device.clientSideIdentifier != nil) {
        os_log_debug(OS_LOG_BLE, "🟢 disconnect: client device=%{public}@", [device clientSideIdentifier]);
        if (device.peripheral.state == CBPeripheralStateConnecting || device.peripheral.state == CBPeripheralStateConnected) {
            [self.cManager cancelPeripheralConnection:device.peripheral];
        }
    } else if (device.serverSideIdentifier != nil) {
        os_log_debug(OS_LOG_BLE, "🟢 disconnect: server device=%{public}@", [device serverSideIdentifier]);
        // check if client device exists with another peripheral identifier
        if (device.remotePeerID != nil) {
            ConnectedPeer *peer = [PeerManager getPeer:device.remotePeerID];
            
            // client handles disconnection
            if (peer.client != nil) {
                [self cancelPeripheralConnection:peer.client.peripheral];
                [peer setChannel:nil];
            } else {
                // no client, destroy object here
                [PeerManager removePeer:device.remotePeerID];
            }
        }
        @synchronized (self.bDevices) {
            [self.bDevices removeObject:device];
        }
    }
}

- (void)cancelPeripheralConnection:(CBPeripheral *__nullable)peripheral {
    if (self.cmEnable) {
        if (!peripheral) {
            os_log_info(OS_LOG_BLE, "🟡 cancelPeripheralConnection: peripheral is null, cannot cancel the connection");
            return ;
        }
        
        BertyDevice *bDevice = [self findPeripheral:peripheral];
        
        if (bDevice != nil && bDevice.peripheral != nil) {
            os_log_debug(OS_LOG_BLE, "🟢 cancelPeripheralConnection: device %{public}@", [bDevice.peripheral.identifier UUIDString]);
            bDevice.peripheral.delegate = nil;
            if (bDevice.peripheral.state == CBPeripheralStateConnecting || bDevice.peripheral.state == CBPeripheralStateConnected) {
                [self.cManager cancelPeripheralConnection:peripheral];
            }
            // Object is removed by didDisconnectPeripheral
            /*@synchronized (self.bDevices) {
                [self.bDevices removeObject:bDevice];
            }*/
        }
    }
}

- (void)cancelAllPeripheralConnections {
    os_log_debug(OS_LOG_BLE, "🟢 cancelAllPeripheralConnection()");
    if (self.cmEnable) {
        @synchronized (self.bDevices) {
            for (BertyDevice *bDevice in self.bDevices) {
                if (bDevice.peripheral != nil) {
                    os_log_debug(OS_LOG_BLE, "🟢 cancelAllPeripheralConnection() Cancel");
                    [self.cManager cancelPeripheralConnection:bDevice.peripheral];
                    [bDevice.queue clear];
                    [bDevice.writeQ clear];
                } else {
                    os_log_debug(OS_LOG_BLE, "🟢 cancelAllPeripheralConnection() Cancel null");
                }
            }
            os_log_debug(OS_LOG_BLE, "🟢 cancelAllPeripheralConnection() Full end");
            [PeerManager removeAllPeers];
            [self.bDevices removeAllObjects];
            [self.pManager removeAllServices];
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

- (BertyDevice *)findPeripheralFromName:(NSString *) name {
    @synchronized (self.bDevices) {
        for (BertyDevice *bDevice in self.bDevices) {
            if ([bDevice.name isEqualToString:name]) {
                return bDevice;
            }
        }
    }
    
    return nil;
}

- (BertyDevice *)findPeripheralFromPID:(NSString *)peerID {
    BertyDevice *result = nil;
    
    @synchronized (self.bDevices) {
        for (BertyDevice *bDevice in self.bDevices) {
            if ([bDevice.remotePeerID isEqualToString:peerID] && bDevice.clientSideIdentifier != nil) {
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
            if ([bDevice.clientSideIdentifier isEqual:id]) {
                result = bDevice;
                break;
            } else if([bDevice.serverSideIdentifier isEqual:id]){
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
    os_log(OS_LOG_BLE, "🟢 didConnectPeripheral() %{public}@", [peripheral.identifier UUIDString]);

    BertyDevice *bDevice = [self findPeripheral:peripheral];
    if (bDevice == nil) {
        os_log_debug(OS_LOG_BLE, "🟢 didConnectPeripheral(): device %{public}@ not found", [peripheral.identifier UUIDString]);
        [self.cManager cancelPeripheralConnection:peripheral];
        return ;
    }
    [bDevice handleConnect:nil];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    os_log(OS_LOG_BLE, "🔴 didFailToConnectPeripheral() %{public}@", [peripheral.identifier UUIDString]);
    
    BertyDevice *bDevice = [self findPeripheral:peripheral];
    if (bDevice == nil) {
        os_log_debug(OS_LOG_BLE, "🔴 didFailToConnectPeripheral(): device %{public}@ not found", [peripheral.identifier UUIDString]);
        return ;
    }
    [bDevice handleConnect:error];
}

- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI {
    NSString *name = nil;
    
    if (advertisementData && [advertisementData.allKeys containsObject:CBAdvertisementDataLocalNameKey]) {
        // between 2 iOS
        name = [advertisementData valueForKeyPath:CBAdvertisementDataLocalNameKey];

    } else if (advertisementData && [advertisementData.allKeys containsObject:CBAdvertisementDataServiceDataKey]) {
        // between Android / iOS
        NSDictionary<CBUUID *, NSData *> *data = [advertisementData valueForKey:CBAdvertisementDataServiceDataKey];
        if (data) {
            CBUUID *uuid = [CBUUID UUIDWithString:@"4240"];
            name = [[NSString alloc] initWithData:[data objectForKey:uuid] encoding:NSUTF8StringEncoding];
            [name autorelease];
        } else {
            os_log_debug(OS_LOG_BLE, "didDiscoverPeripheral: CBAdvertisementDataServiceDataKey doesn't contains any data");
            return ;
        }
    } else {
        // verbose
        // os_log_debug(OS_LOG_BLE, "🟡 didDiscoverPeripheral() device %{public}@ has not advertisement name",
        //        [peripheral.identifier UUIDString]);
        return ;
    }
    
    if ([name length] == 0) {
        os_log_info(OS_LOG_BLE, "🟡 didDiscoverPeripheral() device %{public}@ name is empty",
               [peripheral.identifier UUIDString]);
        return ;
    }
    
    BertyDevice *nDevice = [self findPeripheralFromIdentifier:peripheral.identifier];
    if (nDevice != nil) { // peripheral already known
        if (nDevice.clientSideIdentifier != nil) { // peripheral already discovered
            return ;
        }
        // peripheral already known by CBPeripheralManager (advertising)
        // adding info given by CBCentralManager (scanning)
        [nDevice setPeripheral:peripheral central:self];
        nDevice.clientSideIdentifier = [peripheral.identifier UUIDString];
    } else {
        nDevice = [self findPeripheralFromName:name];
        
        if (nDevice != nil && nDevice.peripheral != nil) { // device already known with another peripheral object
            return ;
        }
        
        // TODO: retest if bDevices is still null after @synchronized
        @synchronized (self.bDevices) {
            nDevice = [[BertyDevice alloc]initWithPeripheral:peripheral central:self withName:name];
            [self.bDevices addObject:nDevice];
            [nDevice release];
            os_log_debug(OS_LOG_BLE, "🟢 didDiscoverPeripheral() device %{public}@ added to BleManager.bDevices",
                   [peripheral.identifier UUIDString]);
        }
    }
    os_log_debug(OS_LOG_BLE, "🟢 didDiscoverPeripheral found device address=%@ name=%@", peripheral.identifier, name);
    [nDevice connectWithOptions:nil];
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    os_log(OS_LOG_BLE, "🟡 didDisconnectPeripheral() for device %{public}@ with error %{public}@", [peripheral.identifier UUIDString], error);
    BertyDevice *nDevice = [self findPeripheral:peripheral];
    if (nDevice != nil) {
        
        // remove peerManager ref
        if (nDevice.peripheral != nil) {
            os_log(OS_LOG_BLE, "🟡 didDisconnectPeripheral() for device %{public}@ with error %{public}@", nDevice.peripheral, error);
            
            if (nDevice.remotePeerID != nil) {
                os_log(OS_LOG_BLE, "🟡 didDisconnectPeripheral() for device %{public}@ with error %{public}@", nDevice.remotePeerID, error);
                
                BLEBridgeHandleLostPeer(nDevice.remotePeerID);
                
                [PeerManager removePeer:nDevice.remotePeerID];
            }
            
            [nDevice.queue clear];
            [nDevice.writeQ clear];
            
            @synchronized (self.bDevices) {
                [self.bDevices removeObject:nDevice];
            }
        }
    }
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

- (void)peripheralManager:(CBPeripheralManager *)peripheral didPublishL2CAPChannel:(CBL2CAPPSM)PSM error:(NSError *)error {
    if (error != nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didPublishL2CAPChannel error=%{public}@", error);
        return ;
    }
    os_log_debug(OS_LOG_BLE, "peripheralManager didPublishL2CAPChannel: PSM=%hu", PSM);
    self.psm = PSM;
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didUnpublishL2CAPChannel:(CBL2CAPPSM)PSM error:(NSError *)error {
    os_log_debug(OS_LOG_BLE, "peripheralManager didUnpublishL2CAPChannel called");
    self.psm = 0;
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didOpenL2CAPChannel:(CBL2CAPChannel *)channel error:(NSError *)error {
    if (error != nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel error=%{public}@", error);
        return ;
    }
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:channel.peer.identifier]) == nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel error: peripheral=%{public}@ not found", [channel.peer.identifier UUIDString]);
        return ;
    }
    
    ConnectedPeer *peer = [PeerManager getPeer:device.remotePeerID];
    if (peer == nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel error: peripheral=%{public}@ peer not found", [channel.peer.identifier UUIDString]);
        return ;
    }
    
    os_log_debug(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel: peripheral=%{public}@ setup channel", [channel.peer.identifier UUIDString]);
    [peer setChannel:channel];
    [channel.inputStream open];
    [channel.outputStream open];
    
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        [device l2capRead:peer];
    });

    [peer setServer:device];
    [peer setServerReady:TRUE];
    if (![device checkAndHandleFoundPeer]) {
        [self disconnect:device];
        return ;
    }
}

#pragma mark - read


- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveReadRequest:(CBATTRequest *)request {
    os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests() reader called for device=%{public}@ request.offset=%lu", [request.central.identifier UUIDString], request.offset);
    
    int psm = NSSwapHostIntToBig(self.psm);
    NSMutableData *toSend = [[NSMutableData alloc] initWithBytes:&psm length:sizeof(psm)];
    [toSend appendData:[self.localPID dataUsingEncoding:NSUTF8StringEncoding]];
        request.value = toSend;
    
        if ([request.characteristic.UUID isEqual:self.peerUUID]) {
            os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests: peerID characteristic selected: %{public}@", [request.central.identifier UUIDString]);

            BertyDevice *remote = [self findPeripheralFromIdentifier:request.central.identifier];
            if (remote == nil) {
                os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): BertyDevice doesn't exist");
                [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
                [toSend release];
                return ;
            }
            if (!remote.remotePeerID) {
                os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): remotePID not set");
                [self disconnect:remote];
                [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
                [toSend release];
                return ;
            }
            
            ConnectedPeer *peer = [PeerManager getPeer:remote.remotePeerID];
            if (!peer) {
                os_log_debug(OS_LOG_BLE, "🟡 didReceiveReadRequests: peerID unknown in the PeerManager");
                peer = [[ConnectedPeer alloc] init];
                [peer setServer:remote];
                [peer setServerReady:TRUE];
                [PeerManager addPeer:peer forPeerID:remote.remotePeerID];
                [peer release];

                [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
                [toSend release];
                toSend = nil;
            } else {
                if ([peer isConnected]) {
                    os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): peerID is already connected");
                    [peripheral respondToRequest:request withResult:CBATTErrorReadNotPermitted];
                    
                    [self disconnect:remote];
                    [toSend release];
                    return ;
                }

[               peripheral respondToRequest:request withResult:CBATTErrorSuccess];
                [toSend release];
                toSend = nil;
                if (remote.psm != 0 && peer.channel == nil && self.psm != 0) {
                    // wait for l2cap connection
                    os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests(): wait for l2cap incoming connection: identifier=%{public}@", [request.central.identifier UUIDString]);
                } else {
                    [peer setServer:remote];
                    [peer setServerReady:TRUE];
                    
                    os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests(): local peerID sent=%{public}@", [NSString stringWithUTF8String:request.value.bytes]);
                    
                    if (![remote checkAndHandleFoundPeer]) {
                        [self disconnect:remote];
                        return ;
                    }
                }
            }
        } else {
            os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): characteristic not found");
            [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
            [toSend release];
            return ;
        }
}


#pragma mark - write

- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    BertyDevice *remote;
    
    NSData *data = nil;

    for (CBATTRequest *request in requests) {
        os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests() writer called for device %{public}@", [request.central.identifier UUIDString]);

        os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests(): payload: %{public}@", request.value);
        CBMutableCharacteristic *characteristic;
        ConnectedPeer *peer = nil;
        @synchronized (self.bDevices) {
            // check if we hold a remote device of this type
            remote = [self findPeripheralFromIdentifier:request.central.identifier];
            if (remote == nil) {
                remote = [[BertyDevice alloc]initWithIdentifier:[request.central.identifier UUIDString] asClient:FALSE];
                [self.bDevices addObject:remote];
                [remote release];
                os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests() device %{public}@ added to BleManager.bDevices",
                       [request.central.identifier UUIDString]);
            }
        }

        if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            peer = [PeerManager getPeer:remote.remotePeerID];
            if (!peer) {
                os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests: peer not existing for device=%{public}@", [request.central.identifier UUIDString]);
                
                // Cannot close the connection from the server so we return a error
                [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
                return ;
            }
            
            if (![peer isConnected]) {
                os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests: peer not connected for this device=%{public}@", [request.central.identifier UUIDString]);
                
                // try to disconnect if the client is connected
                [self disconnect:remote];
                [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
                return ;
            }
            
            characteristic = self.writerCharacteristic;
        }
        else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
            os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests: peerID characteristic selected");
            peer = [PeerManager getPeer:remote.remotePeerID];
            if (peer && [peer isConnected]) {
                os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests: receive peerID for device already connected");
                [self disconnect:remote];
                [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
                return ;
            }

            characteristic = self.peerIDCharacteristic;
        } else {
            os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests(): characteristic not found");
            [self disconnect:remote];
            [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
            return ;
        }
        
        data = request.value;
        
        //os_log(OS_LOG_BLE, "request ACTUALDATA=%{public}@ VAL=%{public}@ UUID=%{public}@ P=%p", data, request.value, request.characteristic.UUID, data);
        
        BOOL(^handler)(NSData *) = [remote.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];
        if (!handler(data)) {
            os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests: handle failed");
            [self disconnect:remote];
            [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
        }
            
        // Handle Response back
            
       request.value = [self.localPID dataUsingEncoding:NSUTF8StringEncoding];
       [peripheral respondToRequest:request withResult:CBATTErrorSuccess];

    }
//    [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorSuccess];
}

@end
