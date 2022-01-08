// +build darwin
//
//  BleManager.m
//  ble
//
//  Created by sacha on 23/05/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import "BleManager_darwin.h"

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

+ (void) printLongLog:(NSString *__nonnull)message {
    if ([message length] > 4000) {
        NSLog(@"message.length=%lu", [message length]);
        unsigned long int chunkCount = [message length] / 4000;     // integer division
        for (int i = 0; i <= chunkCount; i++) {
            int max = 4000 * (i + 1);
            if (max >= [message length]) {
                NSLog(@"chunk %d of %lu: %@", i, chunkCount, [message substringWithRange:NSMakeRange(4000 * i, [message length] - (4000 * i))]);
            } else {
                NSLog(@"chunk %d of %lu: %@", i, chunkCount, [message substringWithRange:NSMakeRange(4000 * i, 4000)]);
            }
        }
    } else {
        NSLog(@"%@", message);
    }
}

// TODO: No need to check error on this?
- (instancetype __nonnull) initDriver:(BOOL)useExternalLogger {
    self = [super init];
    
    if (self) {
        BOOL showSensitiveData = FALSE;
        if (useExternalLogger) {
            _logger = [[Logger alloc] initWithExternalLoggerAndShowSensitiveData:showSensitiveData];
        } else {
            _logger = [[Logger alloc] initLocalLoggerWithSubSystem:LOCAL_DOMAIN andCategorie:"BLE" showSensitiveData:showSensitiveData];
        }
        _peerManager = [[PeerManager alloc] initWithLogger:_logger];
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
    [self.logger d:@"initService called"];
    
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
    [_logger release];
    [_peerManager release];
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
    [self.logger d:@"addService: service=%@", [self.serviceUUID UUIDString]];

    [self.bleOn await:5 withCancelBlock:^{
        [self.logger e:@"addService error: timeout"];
    }];
    if (self.cmEnable && self.pmEnable) {
        [self.pManager addService:self.bertyService];
        [self.serviceAdded await];
    }
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didAddService:(CBService *)service error:(nullable NSError *)error {
    if (error) {
        [self.logger e:@"didAddService() error=%@", [error localizedFailureReason]];
    }
    [self.logger d:@"didAddService: service=%@", [service.UUID UUIDString]];
    [self.serviceAdded countDown];
}

#pragma mark - go called functions

- (void)startScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && !self.scanning) {
            if (self.localPID != nil) {
                [self.logger d:@"startScanning called"];
                
                NSDictionary *options = [NSDictionary
                                         dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                         CBCentralManagerScanOptionAllowDuplicatesKey, nil];
                [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
                self.scanning = TRUE;
                
                dispatch_async(dispatch_get_main_queue(), ^(void){
                    self.scannerTimer = [NSTimer scheduledTimerWithTimeInterval:12.0 target:self selector:@selector(toggleScanner:) userInfo:nil repeats:YES];
                });
            }  else {
                [self.logger e:@"startScanning error: localPID is null"];
            }
        } else {
            [self.logger i:@"startScanning: scanner is already enabled"];
        }
    }
}

- (void)toggleScanner:(NSTimer*)timer {
    if ([self.cManager isScanning]) {
        [self.logger d:@"toggleScanner: disable scanner"];
        [self.cManager stopScan];
    } else {
        [self.logger d:@"toggleScanner: enable scanner"];
        NSDictionary *options = [NSDictionary
                                 dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES],
                                 CBCentralManagerScanOptionAllowDuplicatesKey, nil];
        [self.cManager scanForPeripheralsWithServices:@[self.serviceUUID] options:options];
    }
    
}

- (void)stopScanning {
    @synchronized (self.cManager) {
        if (self.cmEnable && self.scanning) {
            [self.logger d:@"stopScanning called"];
            
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
                [self.logger d:@"startAdvertising called: ID=%@", [self.logger SensitiveNSObject:self.ID]];
                
                // publish l2cap channel
                self.psm = 0;
                if (@available(iOS 11.0, *)) {
                    [self.pManager publishL2CAPChannelWithEncryption:false];
                }
                
                [self.pManager startAdvertising:@{ CBAdvertisementDataLocalNameKey:self.ID, CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]}];
            } else {
                [self.logger e:@"startAdvertising error: local ID is null"];
            }
        }
    }
}

- (void)stopAdvertising {
    @synchronized (self.pManager) {
        [self.logger d:@"stopAdvertising called"];
        if (self.pmEnable && [self.pManager isAdvertising]) {
            if (@available(iOS 11.0, *)) {
                if (self.psm != 0) {
                    [self.pManager unpublishL2CAPChannel:self.psm];
                }
            }
            [self.pManager stopAdvertising];
        } else {
            [self.logger e:@"stopAdvertising error: advertising not started"];
        }
    }
}

// Only the client side can disconnect
- (void)disconnect:(BertyDevice *__nonnull)device {
    [self.logger d:@"closeAllConnections called: debice=%@", [self.logger SensitiveNSObject:[device clientSideIdentifier]]];
    
    if (device.peripheral != nil && device.clientSideIdentifier != nil) {
        [self.logger d:@"disconnect: client device=%@", [self.logger SensitiveNSObject:[device clientSideIdentifier]]];
        if (device.peripheral.state == CBPeripheralStateConnecting || device.peripheral.state == CBPeripheralStateConnected) {
            [self.cManager cancelPeripheralConnection:device.peripheral];
        } else {
            [self.logger d:@"disconnect: client device=%@ not connected", [self.logger SensitiveNSObject:[device clientSideIdentifier]]];
            return ;
        }
    } else {
        [device closeBertyDevice];
    }
}

- (void)closeAllConnections {
    [self.logger i:@"closeAllConnections called"];

    if (self.cmEnable) {
        @synchronized (self.bDevices) {
            for (BertyDevice *device in self.bDevices) {
                [self disconnect:device];
            }
        }
    }
}

- (BOOL)writeAndNotify:(BertyDevice *__nonnull)device data:(NSData *__nonnull)data {
    [self.logger d:@"writeAndNotify: device=%@ base64=%@", [self.logger SensitiveNSObject:[device clientSideIdentifier]], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]]];
    if ([self.logger showSensitiveData]) {
        [BleManager printLongLog:[BleManager NSDataToHex:data]];
    }
    
    BOOL success = FALSE;
    NSUInteger mtu = device.cbCentral.maximumUpdateValueLength;
    NSUInteger offset = 0;
    NSUInteger dataLen = [data length];
    
    while (offset < dataLen) {
        if (![device.peer isServerReady]) {
            [self.logger e:@"writeAndNotify error: device=%@ server not connected", [self.logger SensitiveNSObject:[device clientSideIdentifier]]];
            return FALSE;
        }
        
        self.writerLactch = [[CountDownLatch alloc] initCount:1];
        NSUInteger toWriteLen = (dataLen - offset) < mtu ? (dataLen - offset) : mtu;
        NSData *toWrite = [[data subdataWithRange:NSMakeRange(offset, toWriteLen)] retain];
        
        if ([self.logger showSensitiveData]) {
            [self.logger d:@"writeAndNotify: device=%@ mtu=%lu base64=%@ data=%@", [device getIdentifier], mtu, [toWrite base64EncodedStringWithOptions:0], [BleManager NSDataToHex:toWrite]];
        }
        
        // Need to add data to the cache prior to write it because sometime peripheralManagerIsReadyToUpdateSubscribers is called before data is put to the cache
        @synchronized (self.writeCache) {
            self.writeCache = [[WriteDataCache alloc] initWithDevice:device withData:toWrite];
            [self.logger d:@"writeAndNotify: device=%@: data put in cache successfully", [self.logger SensitiveNSObject:[device getIdentifier]]];
        }
        
        success = [self.pManager updateValue:toWrite forCharacteristic:self.writerCharacteristic onSubscribedCentrals:@[device.cbCentral]];
        
        if (success) {
            [self.writerLactch countDown];
        } else {
            [self.logger d:@"writeAndNotify: device=%@: operation queue is full and will be processed by the peripheralManagerIsReadyToUpdateSubscribers callback", [self.logger SensitiveNSObject:[device getIdentifier]]];
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
    
    [self.logger d:@"writeAndNotify: device=%@: success=%d", [self.logger SensitiveNSObject:[device getIdentifier]], success];
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

#pragma mark - CentraManagerDelegate

- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral {
    [self.logger i:@"didConnectPeripheral called: device=%@", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
    
    BertyDevice *bDevice = [self findPeripheral:peripheral];
    if (bDevice == nil) {
        [self.logger e:@"didConnectPeripheral error: device=%@ not found", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
        [self.cManager cancelPeripheralConnection:peripheral];
        return ;
    }
    [bDevice handleConnect:nil];
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    [self.logger i:@"didFailToConnectPeripheral called: device=%@", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
    
    BertyDevice *bDevice = [self findPeripheral:peripheral];
    if (bDevice == nil) {
        [self.logger e:@"didFailToConnectPeripheral error: device=%@ not found", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
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
            [self.logger d:@"didDiscoverPeripheral error: device=%@: CBAdvertisementDataServiceDataKey doesn't contains any data", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
            return ;
        }
    } else {
        // verbose
//        [self.logger e:@"didDiscoverPeripheral error: device=%@ has not advertisement name", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
        return ;
    }
    
    if ([id length] == 0) {
        [self.logger d:@"didDiscoverPeripheral error: device=%@: id is empty", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
        return ;
    }
    
    // only lower id can be client
    if ([self.ID compare:id] != NSOrderedAscending) {
        // Verbose
//        [self.logger d:@"didDiscoverPeripheral: device=%@: greater ID, cancel client connection", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
        return ;
    }
    
    BertyDevice *nDevice = [self findPeripheralFromIdentifier:peripheral.identifier];
    if (nDevice != nil) { // peripheral already known
        if (nDevice.clientSideIdentifier != nil) { // peripheral already discovered
            return ;
        }
        // peripheral already known by CBPeripheralManager (advertising)
        // adding info given by CBCentralManager (scanning)
        [self.logger d:@"didDiscoverPeripheral: device=%@ id=%@: already known", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]], [self.logger SensitiveNSObject:id]];
        nDevice.peripheral = peripheral;
        nDevice.clientSideIdentifier = [peripheral.identifier UUIDString];
    } else {
        nDevice = [self findPeripheralFromName:id];
        
        if (nDevice != nil && nDevice.peripheral != nil) { // device already known with another peripheral object
            return ;
        }
        
        // TODO: retest if bDevices is still null after @synchronized
        @synchronized (self.bDevices) {
            nDevice = [[BertyDevice alloc]initWithPeripheral:peripheral logger:self.logger central:self withName:id];
            [self.bDevices addObject:nDevice];
            [nDevice release];
            [self.logger d:@"didDiscoverPeripheral: device=%@ added to BleManager.bDevices", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]]];
        }
    }
    [self.logger d:@"didDiscoverPeripheral: device=%@ id=%@: found. Going to connect.", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]], [self.logger SensitiveNSObject:id]];
    [nDevice connectWithOptions:nil];
}

- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {
    [self.logger i:@"didDisconnectPeripheral called: device=%@ error=%@", [self.logger SensitiveNSObject:[peripheral.identifier UUIDString]], error];

    BertyDevice *device = [self findPeripheral:peripheral];
    if (device != nil) {
        [device closeBertyDevice];
        @synchronized (self.bDevices) {
            [self.bDevices removeObject:device];
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
    [self.logger i:@"peripheralManagerDidUpdateState: %@", stateString];
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
    [self.logger i:@"centralManagerDidUpdateState: %@", stateString];
    [self.bleOn countDown];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral central:(CBCentral *)central didSubscribeToCharacteristic:(CBCharacteristic *)characteristic {
    [self.logger d:@"peripheralManager didSubscribeToCharacteristic called: device=%@", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:central.identifier]) == nil) {
        [self.logger e:@"peripheralManager didSubscribeToCharacteristic error: device=%@ not found", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
        return ;
    }
    
    device.cbCentral = central;
    
    // Server doesn't know if the L2CAP handshake failed on the client side
    // so we have to set it manually at this step.
    device.l2capServerHandshakeRunning = FALSE;
    
    // complete handshake
    device.peer = [self.peerManager registerDevice:device withPeerID:device.remotePeerID isClient:FALSE];
    if (device.peer == nil) {
        [self.logger e:@"peripheralManager didSubscribeToCharacteristic error: device=%@: registerDevice failed", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
        return ;
    } else {
        [self.logger d:@"peripheralManager didSubscribeToCharacteristic: device=%@: registerDevice successed", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
    }
}

// server disconnection callback entry point
- (void)peripheralManager:(CBPeripheralManager *)peripheral central:(CBCentral *)central didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
    [self.logger d:@"peripheralManager didUnsubscribeFromCharacteristic called: device=%@", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:central.identifier]) == nil) {
        [self.logger e:@"peripheralManager didUnsubscribeFromCharacteristic error: device=%@ not found", [self.logger SensitiveNSObject:[central.identifier UUIDString]]];
        return ;
    }
    
    [device closeBertyDevice];
    @synchronized (self.bDevices) {
        [self.bDevices removeObject:device];
    }
}

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
    [self.logger d:@"peripheralManager peripheralManagerIsReadyToUpdateSubscribers called"];
    
    self.writeStatus = FALSE;
    
    @synchronized(self.writeCache) {
        if (self.writeCache != nil) {
            if (self.logger.showSensitiveData) {
                [self.logger d:@"peripheralManagerIsReadyToUpdateSubscribers: device=%@ base64=%@ data=%@", [self.writeCache.device getIdentifier], [self.writeCache.data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:self.writeCache.data]];
            }
            
            if (self.writerLactch == nil) {
                [self.logger e:@"peripheralManagerIsReadyToUpdateSubscribers error: writer latch is null"];
                return ;
            }
            
            if (self.writeCache.device.peer == nil) {
                [self.logger e:@"peripheralManagerIsReadyToUpdateSubscribers error: peer object not found"];
                [self.writerLactch countDown];
                return ;
            }
            
            if (![self.writeCache.device.peer isServerReady]) {
                [self.logger e:@"peripheralManagerIsReadyToUpdateSubscribers error: server not connected"];
                [self.writerLactch countDown];
                return ;
            }
            
            self.writeStatus = [self.pManager updateValue:self.writeCache.data forCharacteristic:self.writerCharacteristic onSubscribedCentrals:@[self.writeCache.device.cbCentral]];
            
            if (self.writeStatus) {
                [self.logger d:@"peripheralManagerIsReadyToUpdateSubscribers: device=%@: data sent", [self.logger SensitiveNSObject:[self.writeCache.device getIdentifier]]];
                [self.writerLactch countDown];
            } else {
                [self.logger d:@"peripheralManagerIsReadyToUpdateSubscribers: device=%@: operation queue is full, try later", [self.logger SensitiveNSObject:[self.writeCache.device getIdentifier]]];
                return ;
            }
        }
    }
}

#pragma mark - read


- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveReadRequest:(CBATTRequest *)request {
    [self.logger d:@"didReceiveReadRequests called: device=%@ offset=%lu", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]], request.offset];
    
    if ([request.characteristic.UUID isEqual:self.peerUUID]) {
        [self.logger d:@"didReceiveReadRequests: device=%@: use peerID characteristic", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
        
        BertyDevice *device = [self findPeripheralFromIdentifier:request.central.identifier];
        if (device == nil || device.remotePeerID == nil) {
            [self.logger e:@"didReceiveReadRequests: device=%@: need writeRequest completed before readRequest", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
            [peripheral respondToRequest:request withResult:CBATTErrorReadNotPermitted];
            return ;
        }
        
        // Write PSM to big endian
        int psm = NSSwapHostIntToBig(self.psm);
        NSMutableData *toSend = [[NSMutableData alloc] initWithBytes:&psm length:sizeof(psm)];
        [toSend appendData:[self.localPID dataUsingEncoding:NSUTF8StringEncoding]];
        request.value = toSend;
        
        [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
        [toSend release];
    } else {
        [self.logger e:@"didReceiveReadRequests: device=%@: bad characteristic requested", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
        [peripheral respondToRequest:request withResult:CBATTErrorRequestNotSupported];
        return ;
    }
}


#pragma mark - write

- (void)peripheralManager:(CBPeripheralManager *)peripheral didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
    
    BertyDevice *device;
    NSData *data = nil;
    
    for (CBATTRequest *request in requests) {
        [self.logger d:@"didReceiveWriteRequests: device=%@ base64=%@", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]]];
        if (self.logger.showSensitiveData) {
            [BleManager printLongLog:[BleManager NSDataToHex:data]];
        }
        
        CBMutableCharacteristic *characteristic;
        
        @synchronized (self.bDevices) {
            // check if we hold a remote device of this type
            device = [self findPeripheralFromIdentifier:request.central.identifier];
            if (device == nil) {
                device = [[BertyDevice alloc]initWithIdentifier:[request.central.identifier UUIDString] logger:self.logger central:self asClient:FALSE];
                [self.bDevices addObject:device];
                [device release];
                [self.logger d:@"didReceiveWriteRequests: device=%@ added to BleManager.bDevices", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
            }
        }
        
        if ([request.characteristic.UUID isEqual:self.writerUUID]) {
            characteristic = self.writerCharacteristic;
        }
        else if ([request.characteristic.UUID isEqual:self.peerUUID]) {
            characteristic = self.peerIDCharacteristic;
        } else {
            [self.logger e:@"didReceiveWriteRequests error: device=%@: bad characteristic requested", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
            [device closeBertyDevice];
            [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
            return ;
        }
        
        data = request.value;
        
        BOOL(^handler)(NSData *) = [device.characteristicHandlers objectForKey:[request.characteristic.UUID UUIDString]];
        if (!handler(data)) {
            [self.logger e:@"didReceiveWriteRequests error: device=%@: handle failed", [self.logger SensitiveNSObject:[request.central.identifier UUIDString]]];
            [device closeBertyDevice];
            [peripheral respondToRequest:request withResult:CBATTErrorWriteNotPermitted];
        }
        
        // Process response back
        request.value = [self.localPID dataUsingEncoding:NSUTF8StringEncoding];
    }
    [peripheral respondToRequest:[requests objectAtIndex:0] withResult:CBATTErrorSuccess];
}

#pragma mark - L2cap

- (void)peripheralManager:(CBPeripheralManager *)peripheral didPublishL2CAPChannel:(CBL2CAPPSM)PSM error:(NSError *)error {
    if (error != nil) {
        [self.logger e:@"peripheralManager didPublishL2CAPChannel error=%@", error];
        return ;
    }
    [self.logger d:@"peripheralManager didPublishL2CAPChannel: PSM=%hu", PSM];
    self.psm = PSM;
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didUnpublishL2CAPChannel:(CBL2CAPPSM)PSM error:(NSError *)error {
    [self.logger d:@"peripheralManager didUnpublishL2CAPChannel called"];
    
    self.psm = 0;
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral didOpenL2CAPChannel:(CBL2CAPChannel *)channel error:(NSError *)error API_AVAILABLE(ios(11.0)) {
    [self.logger d:@"peripheralManager didOpenL2CAPChannel called: device=%@", [self.logger SensitiveNSObject:[channel.peer.identifier UUIDString]]];
    
    if (error != nil) {
        [self.logger e:@"peripheralManager didOpenL2CAPChannel error=%@", error];
        return ;
    }
    
    BertyDevice *device;
    if ((device = [self findPeripheralFromIdentifier:channel.peer.identifier]) == nil) {
        [self.logger e:@"peripheralManager didOpenL2CAPChannel error: device=%@ not found", [self.logger SensitiveNSObject:[channel.peer.identifier UUIDString]]];
        return ;
    }
        
    device.l2capChannel = channel;
    
    device.l2capThread = [[NSThread alloc] initWithBlock:^{
        [self.logger d:@"peripheralManager didOpenL2CAPChannel: device=%@: in thread", [self.logger SensitiveNSObject:[device getIdentifier]]];
        
        channel.inputStream.delegate = device;
        [channel.inputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
        [channel.inputStream open];
        channel.outputStream.delegate = device;
        [channel.outputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
        [channel.outputStream open];
        
        @autoreleasepool {
            do {
                [[NSRunLoop currentRunLoop] run];
            } while (device.peer != nil && [device.peer isConnected]);
        }
    }];
    [device.l2capThread start];
    
    device.l2capServerHandshakeRunning = TRUE;
}

@end
