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
#import "CircularQueue.h"
#import "WriteDataCache.h"
#import "CountDownLatch_darwin.h"
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

static inline char itoh(int i) {
    if (i > 9) return 'A' + (i - 10);
    return '0' + i;
}

+ (NSString *__nonnull)NSDataToHex:(NSData *__nonnull)data {
    NSUInteger i, len;
    unsigned char *buf, *bytes;
    
    len = data.length;
    bytes = (unsigned char*)data.bytes;
    buf = malloc(len*2);
    
    for (i=0; i<len; i++) {
        buf[i*2] = itoh((bytes[i] >> 4) & 0xF);
        buf[i*2+1] = itoh(bytes[i] & 0xF);
    }
    
    return [[[NSString alloc] initWithBytesNoCopy:buf
                                           length:len*2
                                         encoding:NSASCIIStringEncoding
                                     freeWhenDone:YES] autorelease];
}

// TODO: No need to check error on this?
- (instancetype __nonnull) initScannerAndAdvertiser {
    os_log_debug(OS_LOG_BLE, "🟢 peripheralManager: initScannerAndAdvertiser");
    self = [super init];
    
    if (self) {
        _cmEnable = FALSE;
        _pmEnable = FALSE;
        _scannerTimer = nil;
        _bleOn = [[CountDownLatch alloc] initCount:2];
        _serviceAdded = [[CountDownLatch alloc] initCount:1];
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
                             properties:CBCharacteristicPropertyWrite | CBCharacteristicPropertyNotify
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
                os_log_debug(OS_LOG_BLE, "🟢 startScanning: localPID=%{public}@", self.localPID);
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
            if (self.ID != nil) {
                os_log_debug(OS_LOG_BLE, "🟢 startAdvertising() name=%{public}@", self.ID);
                
                // publish l2cap channel
                self.psm = 0;
                // TODO: fix l2cap
                //[self.pManager publishL2CAPChannelWithEncryption:false];
                
                [self.pManager startAdvertising:@{ CBAdvertisementDataLocalNameKey:self.ID, CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
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
                [PeerManager unregisterDevice:device];
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

- (BOOL)writeAndNotify:(BertyDevice *__nonnull)device data:(NSData *__nonnull)data {
    os_log_debug(OS_LOG_BLE, "writeAndNotify: identifier=%{public}@ base64=%{public}@ data=%{public}@", [device getIdentifier], [data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:data]);
    if (![device.peer isServerReady]) {
        os_log_error(OS_LOG_BLE, "writeAndNotify error: identifier=%{public}@ server not connected", [device getIdentifier]);
        return FALSE;
    }
    
    BOOL success = FALSE;
    NSUInteger mtu = device.cbCentral.maximumUpdateValueLength;
    NSUInteger offset = 0;
    NSUInteger dataLen = [data length];
    
    while (offset < dataLen) {
        self.writerLactch = [[CountDownLatch alloc] initCount:1];
        NSUInteger toWriteLen = (dataLen - offset) < mtu ? (dataLen - offset) : mtu;
        NSData *toWrite = [[data subdataWithRange:NSMakeRange(offset, toWriteLen)] retain];
        
        os_log_debug(OS_LOG_BLE, "writeAndNotify: identifier=%{public}@ mtu=%lu base64=%{public}@ data=%{public}@", [device getIdentifier], mtu, [toWrite base64EncodedStringWithOptions:0], [BleManager NSDataToHex:toWrite]);
        
        // Need to add data to the cache prior to write it because sometime peripheralManagerIsReadyToUpdateSubscribers is called before data is put to the cache
        @synchronized (self.writeCache) {
            self.writeCache = [[WriteDataCache alloc] initWithDevice:device withData:toWrite];
            os_log(OS_LOG_BLE, "writeAndNotify: identifier=%{public}@: data put in cache successfully", [device getIdentifier]);
        }
        
        success = [self.pManager updateValue:toWrite forCharacteristic:self.writerCharacteristic onSubscribedCentrals:@[device.cbCentral]];
        
        if (success) {
            [self.writerLactch countDown];
        } else {
            os_log(OS_LOG_BLE, "writeAndNotify: identifier=%{public}@: operation queue is full and will be processed by the peripheralManagerIsReadyToUpdateSubscribers callback", [device getIdentifier]);
        }
        
        [self.writerLactch await];
        
        // take write status from peripheralManagerIsReadyToUpdateSubscribers
        if (!success) {
            success = self.writeStatus;
        }
        
        [self.writeCache release];
        self.writeCache = nil;
        [self.writerLactch release];
        self.writerLactch = nil;
        [toWrite release];
        
        // this time write failed, don't continue
        if (!success) {
            break ;
        }
        
        offset += toWriteLen;
    }
    
    os_log_debug(OS_LOG_BLE, "writeAndNotify: identifier=%{public}@: success=%d", [device getIdentifier], success);
    return success;
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
            if ([bDevice.clientSideIdentifier isEqual:id]) {
                result = bDevice;
                break;
            } else if ([bDevice.serverSideIdentifier isEqual:id]) {
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
    NSString *id = nil;
    
    if (advertisementData && [advertisementData.allKeys containsObject:CBAdvertisementDataLocalNameKey]) {
        // between 2 iOS
        id = [advertisementData valueForKeyPath:CBAdvertisementDataLocalNameKey];
        
    } else if (advertisementData && [advertisementData.allKeys containsObject:CBAdvertisementDataServiceDataKey]) {
        // between Android / iOS
        NSDictionary<CBUUID *, NSData *> *data = [advertisementData valueForKey:CBAdvertisementDataServiceDataKey];
        if (data) {
            CBUUID *uuid = [CBUUID UUIDWithString:@"4240"];
            id = [[NSString alloc] initWithData:[data objectForKey:uuid] encoding:NSUTF8StringEncoding];
            [id autorelease];
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
    
    if ([id length] == 0) {
        os_log_debug(OS_LOG_BLE, "🟡 didDiscoverPeripheral() device %{public}@ name is empty",
                     [peripheral.identifier UUIDString]);
        return ;
    }
    
    // only lower id can be client
    if ([self.ID compare:id] != NSOrderedAscending) {
        //        os_log_debug(OS_LOG_BLE, "didDiscoverPeripheral: device=%{public}@: greater ID, cancel client connection", peripheral.identifier);
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
        nDevice = [self findPeripheralFromName:id];
        
        if (nDevice != nil && nDevice.peripheral != nil) { // device already known with another peripheral object
            return ;
        }
        
        // TODO: retest if bDevices is still null after @synchronized
        @synchronized (self.bDevices) {
            nDevice = [[BertyDevice alloc]initWithPeripheral:peripheral central:self withName:id];
            [self.bDevices addObject:nDevice];
            [nDevice release];
            os_log_debug(OS_LOG_BLE, "🟢 didDiscoverPeripheral() device %{public}@ added to BleManager.bDevices",
                         [peripheral.identifier UUIDString]);
        }
    }
    os_log_debug(OS_LOG_BLE, "🟢 didDiscoverPeripheral found device address=%@ name=%@", peripheral.identifier, id);
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
                
                [PeerManager unregisterDevice:nDevice];
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

- (void)peripheralManager:(CBPeripheralManager *)peripheral central:(CBCentral *)central didSubscribeToCharacteristic:(CBCharacteristic *)characteristic {
    os_log_debug(OS_LOG_BLE, "peripheralManager didSubscribeToCharacteristic: identifier=%{public}@", [central.identifier UUIDString]);
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:central.identifier]) == nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didSubscribeToCharacteristic error: peripheral=%{public}@ not found", [central.identifier UUIDString]);
        return ;
    }
    
    device.cbCentral = central;
    
    // complete handshake
    device.peer = [PeerManager registerDevice:device withPeerID:device.remotePeerID isClient:FALSE];
    if (device.peer == nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didSubscribeToCharacteristic(): identifier=%{public}@: registerDevice failed", [central.identifier UUIDString]);
        return ;
    } else {
        os_log_debug(OS_LOG_BLE, "peripheralManager didSubscribeToCharacteristic(): identifier=%{public}@ registerDevice successed", [central.identifier UUIDString]);
    }
}

// server disconnection callback entry point
- (void)peripheralManager:(CBPeripheralManager *)peripheral central:(CBCentral *)central didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
    os_log_debug(OS_LOG_BLE, "peripheralManager didUnsubscribeFromCharacteristic: identifier=%{public}@", [central.identifier UUIDString]);
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:central.identifier]) == nil) {
        os_log_error(OS_LOG_BLE, "peripheralManager didUnsubscribeFromCharacteristic error: peripheral=%{public}@ not found", [central.identifier UUIDString]);
        return ;
    }
    
    [self disconnect:device];
}

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
    os_log_debug(OS_LOG_BLE, "peripheralManager peripheralManagerIsReadyToUpdateSubscribers called");
    
    self.writeStatus = FALSE;
    
    @synchronized(self.writeCache) {
        if (self.writeCache != nil) {
            os_log_debug(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers: identifier=%{public}@ base64=%{public}@ data=%{public}@", [self.writeCache.device getIdentifier], [self.writeCache.data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:self.writeCache.data]);
            
            if (self.writerLactch == nil) {
                os_log_error(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers error: writer latch is null");
                return ;
            }
            
            if (self.writeCache.device.peer == nil) {
                os_log_error(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers error: peer object not found");
                [self.writerLactch countDown];
                return ;
            }
            
            if (![self.writeCache.device.peer isServerReady]) {
                os_log_error(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers error: server not connected");
                [self.writerLactch countDown];
                return ;
            }
            
            self.writeStatus = [self.pManager updateValue:self.writeCache.data forCharacteristic:self.writerCharacteristic onSubscribedCentrals:@[self.writeCache.device.cbCentral]];
            
            if (self.writeStatus) {
                os_log_debug(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers: identifier=%{public}@: data sent", [self.writeCache.device getIdentifier]);
                [self.writerLactch countDown];
            } else {
                os_log_error(OS_LOG_BLE, "peripheralManagerIsReadyToUpdateSubscribers: identifier=%{public}@: operation queue is full, try later", [self.writeCache.device getIdentifier]);
                return ;
            }
        }
    }
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
    
    // BertyDevice *device;
    // if ((device = [self findPeripheralFromIdentifier:channel.peer.identifier]) == nil) {
    //     os_log_error(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel error: peripheral=%{public}@ not found", [channel.peer.identifier UUIDString]);
    //     return ;
    // }
    
    // ConnectedPeer *peer = [PeerManager getPeer:device.remotePeerID];
    // if (peer == nil) {
    //     os_log_error(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel error: peripheral=%{public}@ peer not found", [channel.peer.identifier UUIDString]);
    //     return ;
    // }
    
    // os_log_debug(OS_LOG_BLE, "peripheralManager didOpenL2CAPChannel: peripheral=%{public}@ setup channel", [channel.peer.identifier UUIDString]);
    // [peer setChannel:channel];
    // [channel.inputStream open];
    // [channel.outputStream open];
    
    // dispatch_async(dispatch_get_global_queue(0, 0), ^{
    //     [device l2capRead:peer];
    // });
    
    // [peer setServer:device];
    // [peer setServerReady:TRUE];
    // if (![device checkAndHandleFoundPeer]) {
    //     [self disconnect:device];
    //     return ;
    // }
}

#pragma mark - read


- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveReadRequest:(CBATTRequest *)request {
    os_log_debug(OS_LOG_BLE, "didReceiveReadRequests() reader called for device=%{public}@ request.offset=%lu", [request.central.identifier UUIDString], request.offset);
    
    if ([request.characteristic.UUID isEqual:self.peerUUID]) {
        os_log_debug(OS_LOG_BLE, "didReceiveReadRequests: peerID characteristic selected: %{public}@", [request.central.identifier UUIDString]);
        
        BertyDevice *device = [self findPeripheralFromIdentifier:request.central.identifier];
        if (device == nil || device.remotePeerID == nil) {
            os_log_error(OS_LOG_BLE, "didReceiveReadRequests(): device=%{public}@: write peerID not completed", [request.central.identifier UUIDString]);
            [peripheral respondToRequest:request withResult:CBATTErrorReadNotPermitted];
            return ;
        }
        
        int psm = NSSwapHostIntToBig(self.psm);
        NSMutableData *toSend = [[NSMutableData alloc] initWithBytes:&psm length:sizeof(psm)];
        [toSend appendData:[self.localPID dataUsingEncoding:NSUTF8StringEncoding]];
        request.value = toSend;
        
        [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        [toSend release];
        
        //            ConnectedPeer *peer = [PeerManager getPeer:device.remotePeerID];
        //            if (!peer) {
        //                os_log_debug(OS_LOG_BLE, "🟡 didReceiveReadRequests: peerID unknown in the PeerManager");
        //                peer = [[ConnectedPeer alloc] init];
        //                [peer setServer:remote];
        //                [peer setServerReady:TRUE];
        //                [PeerManager addPeer:peer forPeerID:remote.remotePeerID];
        //                [peer release];
        //
        //                [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        //                [toSend release];
        //                toSend = nil;
        //            } else {
        //                if ([peer isConnected]) {
        //                    os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): peerID is already connected");
        //                    [peripheral respondToRequest:request withResult:CBATTErrorReadNotPermitted];
        //
        //                    [self disconnect:remote];
        //                    [toSend release];
        //                    return ;
        //                }
        //                [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        //                [toSend release];
        //                toSend = nil;
        //                if (remote.psm != 0 && peer.channel == nil && self.psm != 0) {
        //                    // wait for l2cap connection
        //                    os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests(): wait for l2cap incoming connection: identifier=%{public}@", [request.central.identifier UUIDString]);
        //                } else {
        //                    [peer setServer:remote];
        //                    [peer setServerReady:TRUE];
        //
        //                    os_log_debug(OS_LOG_BLE, "🟢 didReceiveReadRequests(): local peerID sent=%{public}@", [NSString stringWithUTF8String:request.value.bytes]);
        //
        //                    if (![remote checkAndHandleFoundPeer]) {
        //                        [self disconnect:remote];
        //                        return ;
        //                    }
        //                }
        //            }
    } else {
        os_log_error(OS_LOG_BLE, "🔴 didReceiveReadRequests(): bad characteristic");
        [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
        return ;
    }
}


#pragma mark - write

- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    BertyDevice *device;
    
    NSData *data = nil;
    
    for (CBATTRequest *request in requests) {
        os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests() writer called for device %{public}@", [request.central.identifier UUIDString]);
        
        os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests(): payload: %{public}@", request.value);
        CBMutableCharacteristic *characteristic;
        
        @synchronized (self.bDevices) {
            // check if we hold a remote device of this type
            device = [self findPeripheralFromIdentifier:request.central.identifier];
            if (device == nil) {
                device = [[BertyDevice alloc]initWithIdentifier:[request.central.identifier UUIDString] asClient:FALSE];
                [self.bDevices addObject:device];
                [device release];
                os_log_debug(OS_LOG_BLE, "🟢 didReceiveWriteRequests() device %{public}@ added to BleManager.bDevices",
                             [request.central.identifier UUIDString]);
            }
        }
        
        if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            characteristic = self.writerCharacteristic;
        }
        else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
            characteristic = self.peerIDCharacteristic;
        } else {
            os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests(): bad characteristic");
            [self disconnect:device];
            [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
            return ;
        }
        
        data = request.value;
        
        //os_log(OS_LOG_BLE, "request ACTUALDATA=%{public}@ VAL=%{public}@ UUID=%{public}@ P=%p", data, request.value, request.characteristic.UUID, data);
        
        BOOL(^handler)(NSData *) = [device.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];
        if (!handler(data)) {
            os_log_error(OS_LOG_BLE, "🔴 didReceiveWriteRequests: handle failed");
            [self disconnect:device];
            [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
        }
        
        // Handle Response back
        
        request.value = [self.localPID dataUsingEncoding:NSUTF8StringEncoding];
    }
    
    [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorSuccess];
}

@end
