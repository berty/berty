// +build darwin
//
//  BertyDevice.m
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import "BertyDevice_darwin.h"
#import "BleManager_darwin.h"

extern unsigned short handlePeerFound(char *, char *);
extern void receiveFromDevice(char *, void *, int);

static NSString* const __nonnull EOD = @"EOD";
static const int L2CAP_BUFFER = 4096;
static const int L2CAP_HANDSHAKE_DATA = 1024;

CBService *getService(NSArray *services, NSString *uuid) {
    CBService *result = nil;
    
    for (CBService *service in services) {
        if ([service.UUID.UUIDString containsString:uuid] != NSNotFound) {
            result = service;
        }
    }
    return result;
}

@implementation BertyDevice

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral logger:(Logger *__nonnull)logger
                           central:(BleManager *)manager withName:(NSString *__nonnull)name {
    self = [self initWithIdentifier:[peripheral.identifier UUIDString] logger:logger central:manager asClient:TRUE];
    
    if (self) {
        _peripheral = [peripheral retain];
        _name = name;
    }
    
    return self;
}

- (instancetype)initWithIdentifier:(NSString *)identifier logger:(Logger *__nonnull)logger central:(BleManager *)manager asClient:(BOOL)client{
    self = [super init];
    
    if (self) {
        if (client) {
            _clientSideIdentifier = [identifier retain];
        } else {
            _serverSideIdentifier = [identifier retain];
        }
        
        _logger = [logger retain];
        _peripheral = nil;
        _manager = manager;
        _remotePeerID = nil;
        _psm = 0;
        
        _connectionQ = [[BleQueue alloc] init: dispatch_get_main_queue() logger:logger];
        _writeQ = [[BleQueue alloc] init: dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0) logger:logger];
        _readQ = [[BleQueue alloc] init: dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0) logger:logger];
        
        BOOL (^peerIDHandler)(NSData *data) = ^BOOL(NSData *data) {
            return [self handlePeerID:data];
        };
        
        BOOL (^writeHandler)(NSData *data) = ^BOOL(NSData *data) {
            return [self handleIncomingData:data];
        };
        
        _characteristicHandlers = [@{
            [BleManager.writerUUID UUIDString]: [[writeHandler copy] autorelease],
            [BleManager.peerUUID UUIDString]: [[peerIDHandler copy] autorelease],
        } retain];
        
        _characteristicData = [@{
            [BleManager.writerUUID UUIDString]: [NSMutableData data],
            [BleManager.peerUUID UUIDString]: [NSMutableData data],
        } retain];
        
        // put inside incoming message arrived before handsake is completed
        _dataCache = [[CircularQueue alloc] initWithCapacity:10];
        
        _writerLatch = [[NSObject alloc] init];
    }
    
    return self;
}

- (void)dealloc {
    [_logger release];
    [_clientSideIdentifier release];
    [_serverSideIdentifier release];
    [_peripheral release];
    _manager = nil;
    [_remotePeerID release];
    [_connectionQ release];
    [_writeQ release];
    [_readQ release];
    [_characteristicHandlers release];
    [_characteristicData release];
    [_dataCache release];
    [_writerLatch release];
    
    [super dealloc];
}

- (NSString *__nonnull)getIdentifier {
    if (self.clientSideIdentifier != nil) {
        return self.clientSideIdentifier;
    }
    
    return self.serverSideIdentifier;
}

- (void)closeL2cap {
    [self.logger d:@"closeL2cap: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    if (self.l2capChannel != nil) {
        [self.l2capChannel.inputStream close];
        [self.l2capChannel.outputStream close];

        if (self.l2capThread != nil) {
            [self.l2capThread cancel];
            [self.l2capThread release];
            self.l2capThread = nil;
        }
    }
}

- (void)closeBertyDevice {
    @synchronized (self) {
        [self.logger d:@"closeBertyDevice: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
        
        if (!self.isDisconnecting) {
            self.isDisconnecting = TRUE;
            
            [self.connectionQ clear];
            [self.writeQ clear];
            [self.readQ clear];
            
            [self closeL2cap];
            if (self.peer != nil) {
                [self.manager.peerManager unregisterDevice:self];
                self.peer = nil;
            }
        } else {
            [self.logger d:@"closeBertyDevice: device=%@ is already disconnecting", [self.logger SensitiveNSObject:[self getIdentifier]]];
        }
        self.isDisconnecting = FALSE;
    }
}

- (BOOL)handlePeerID:(NSData *__nonnull)peerIDData {
    if (self.peer != nil && [self.peer isConnected]) {
        [self.logger e:@"handlePeerID: device=%@: peer already connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return FALSE;
    }
    
    NSMutableData *tmpData = [self.characteristicData objectForKey:[BleManager.peerUUID UUIDString]];
    
    if ([peerIDData isEqual:[EOD dataUsingEncoding:NSUTF8StringEncoding]]) {
        // adding 0 byte
        unsigned char zeroByte = 0;
        @synchronized (tmpData) {
            [tmpData appendBytes:&zeroByte length:1];
        }
        
        NSString *remotePeerID = [NSString stringWithUTF8String:[tmpData bytes]];
        // reset tmpData
        [tmpData setLength:0];
        [self.logger d:@"handlePeerID: device=%@: current peerID=%@, new peerID=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:self.remotePeerID], [self.logger SensitiveNSObject:remotePeerID]];
        self.remotePeerID = remotePeerID;
    } else {
        @synchronized (tmpData) {
            [self.logger d:@"handlePeerID: device=%@: add to buffer data=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:peerIDData]];
            [tmpData appendData:peerIDData];
        }
    }
    return TRUE;
}

- (BOOL)putIncomingDataInCache:(NSData *__nonnull)data {
    @try {
        [self.dataCache offer:data];
    }
    @catch (NSException *e) {
        [self.logger e:@"putIncomingDataInCache error: device=%@: cannot add data in cache", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return FALSE;
    }
    return TRUE;
}

- (BOOL)handleIncomingData:(NSData *__nonnull)data {
    [self.logger d:@"handleIncomingData called: identifier=%@ len=%lu base64=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [data length], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]]];
    if ([self.logger showSensitiveData]) {
        [BleManager printLongLog:[BleManager NSDataToHex:data]];
    }
    
    if (self.l2capClientHandshakeRunning) {
        [self.l2capHandshakeRecvData appendBytes:data length:[data length]];
        if ([self.l2capHandshakeRecvData length] < L2CAP_HANDSHAKE_DATA) {
            [self.logger d:@"handleIncomingData: device=%@: client handshake received incompleted payload: length=%lu", [self.logger SensitiveNSObject:[self getIdentifier]], [self.l2capHandshakeRecvData length]];
        } else if ([self.l2capHandshakeRecvData length] == L2CAP_HANDSHAKE_DATA) {
            if ([data isEqualToData:self.l2capHandshakeData]) {
                [self.logger d:@"handleIncomingData: device=%@: client handshake received payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
                self.l2capHandshakeStepStatus = TRUE;
                dispatch_block_cancel(self.l2capHandshakeBlock);
                [self.l2capHandshakeLatch countDown];
            } else {
                [self.logger e:@"handleIncomingData: device=%@: client handshake received wrong payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
                dispatch_block_cancel(self.l2capHandshakeBlock);
                [self.l2capHandshakeLatch countDown];
                [self.manager disconnect:self];
            }
        } else {
            [self.logger e:@"handleIncomingData: device=%@: client handshake received bigger payload than expected: length=%lu", [self.logger SensitiveNSObject:[self getIdentifier]], [self.l2capHandshakeRecvData length]];;
        }
    } else if (self.l2capServerHandshakeRunning) {
        if (!self.l2capHandshakeStepStatus) {
            [self.logger d:@"handleIncomingData: device=%@: server handshake received payload, going to write it back", [self.logger SensitiveNSObject:[self getIdentifier]]];
            
            // the server side needs to know when it receives all 1st step data, so it must count data len
            self.l2capHandshakeRecvDataLen += [data length];
            if (self.l2capHandshakeRecvDataLen == L2CAP_HANDSHAKE_DATA) {
                self.l2capHandshakeStepStatus = TRUE;
                self.l2capHandshakeRecvDataLen = 0;
            }
            
            if (![self l2capWrite:data]) {
                [self.logger e:@"handleIncomingData: device=%@: server handshake write error", [self.logger SensitiveNSObject:[self getIdentifier]]];
                self.l2capServerHandshakeRunning = FALSE;
                self.l2capHandshakeStepStatus = FALSE;
            }
        } else if ([data isEqualToData:[self.manager.localPID dataUsingEncoding:NSUTF8StringEncoding]]) {
            [self.logger d:@"handleIncomingData: device=%@: server handshake received second payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
            self.l2capServerHandshakeRunning = FALSE;
            self.useL2cap = TRUE;
        } else {
            [self.logger e:@"handleIncomingData: device=%@: server handshake received wrong payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
        }
    } else {
        if (!self.peer) {
            [self.logger e:@"handleIncomingData: device=%@: peer not existing", [self.logger SensitiveNSObject:[self getIdentifier]]];
            return [self putIncomingDataInCache:data];
        }
        
        if (![self.peer isConnected]) {
            [self.logger d:@"handleIncomingData: device=%@: peer not connected, put data in cache", [self.logger SensitiveNSObject:[self getIdentifier]]];
            return [self putIncomingDataInCache:data];
        }
        
        [self.readQ add:^{
            BLEBridgeReceiveFromPeer(self.remotePeerID, data);
            [self.readQ completedTask:nil];
        } withCallback:nil withDelay:0];
    }
    return TRUE;
}

// Need to copy blocks into the heap because writing is async and the handshake function's stack should not be available
- (void)handshake {
    if (![self writeToCharacteristic:[self.manager.localPID dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:self.peerIDCharacteristic withEOD:TRUE]) {
        [self.manager disconnect:self];
        return ;
    }
    
    if (![self readToCharacteristic:self.peerIDCharacteristic]) {
        [self.manager disconnect:self];
        return ;
    }
    
    [self negotiateL2cap];
    
    if (![self setNotifyValue]) {
        [self.manager disconnect:self];
    }
}

- (BOOL)setNotifyValue {
    if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
        [self.logger d:@"setNotifyValue: going to subscribe to writer notifications"];
        [self.writeQ add:^{
            if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
                [self.logger d:@"setNotifyValue: subscribing to writer notifications"];
                [self.peripheral setNotifyValue:TRUE forCharacteristic:self.writerCharacteristic];
            }
        } withCallback:nil withDelay:0];
        
        return TRUE;
    }
    
    return FALSE;
}

- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices {
    CBService *service = getService(invalidatedServices, [BleManager.serviceUUID UUIDString]);
    if (service == nil) {
        return;
    }
    [self.logger d:@"didModifyServices: devive=%@ service=%@", [self.logger SensitiveNSObject:[self getIdentifier]], invalidatedServices];
    
    [self.manager disconnect:self];
}

- (void)handleConnect:(NSError *)error {
    [self.connectionQ completedTask:error];
    
    if (error) {
        [self.logger e:@"handleConnect error: device=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], error];
        [self.manager disconnect:self];
        return;
    }
    
    [self.logger i:@"handleConnect: device=%@: connection successed", [self.logger SensitiveNSObject:[self getIdentifier]]];
    [self discoverServices:@[self.manager.serviceUUID]];
}

- (void)connectWithOptions:(NSDictionary *)options {
    [self.logger d:@"connectWithOptions called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    [self.connectionQ add:^{
        [self.logger d:@"connectWithOptions: device=%@: in queue for connecting", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager.cManager connectPeripheral:self.peripheral options:nil];
    } withCallback:nil withDelay:0];
}

#pragma mark - write functions

- (void)flushCache {
    [self.logger d:@"flushCache called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    while ([self.dataCache element] != [NSNull null]) {
        NSData *data = [[self.dataCache poll] retain];
        [self.logger d:@"flushCache: device=%@ base64=%@ data=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]], [self.logger SensitiveNSObject:[BleManager NSDataToHex:data]]];
        BLEBridgeReceiveFromPeer(self.remotePeerID, data);
        [data release];
    }
}

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
        self.remainingData = [[NSData alloc]
                              initWithBytes:[self.remainingData bytes] + chunckSize
                              length:[self.remainingData length] - chunckSize];
    }
    
    return result;
}

- (BOOL)writeToCharacteristic:(NSData *)data forCharacteristic:(CBCharacteristic *)characteristic withEOD:(BOOL)eod {
    @synchronized (self.writerLatch) {
        [self.logger d:@"writeToCharacteristic called: device=%@ base64=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]]];
        if ([self.logger showSensitiveData]) {
            [BleManager printLongLog:[BleManager NSDataToHex:data]];
        }
        
        __block BOOL success = FALSE;
        NSData *toSend = nil;
        self.remainingData = data;
        
        while (self.remainingData.length > 0) {
            if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
                toSend = [[self getDataToSend] retain];
                CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
                
                [self.logger d:@"writeToCharacteristic: device=%@: going to write payload=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:[toSend base64EncodedStringWithOptions:0]]];
                [self.writeQ add:^{
                    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
                        [self.logger e:@"writeToCharacteristic error: device=%@ not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
                        success = FALSE;
                        [countDownLatch countDown];
                        return ;
                    }
                    
                    [self.logger d:@"writeToCharacteristic: device=%@: writing base64=%@ data=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:[toSend base64EncodedStringWithOptions:0]], [self.logger SensitiveNSObject:[BleManager NSDataToHex:toSend]]];
                    [self.peripheral writeValue:toSend forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
                } withCallback:^(NSError *error){
                    [self.logger d:@"writeToCharacteristic: device=%@: callback called for payload=%@ status=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [self.logger SensitiveNSObject:[toSend base64EncodedStringWithOptions:0]], error];
                    success = error == nil ? TRUE : FALSE;
                    [countDownLatch countDown];
                } withDelay:0];
                
                [countDownLatch await];
                [countDownLatch release];
                
                [toSend release];
                
                // don't write EOD is error occured
                if (!success) {
                    [self.logger e:@"writeToCharacteristic error: device=%@: cancellation of the following writes", [self.logger SensitiveNSObject:[self getIdentifier]]];
                    return FALSE;
                }
            } else {
                [self.logger e:@"writeToCharacteristic error: device=%@ not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
                return FALSE;
            }
        }
        
        if (eod) {
            dispatch_semaphore_t sema = dispatch_semaphore_create(0);
            
            [self.logger d:@"writeToCharacteristic: device=%@ going to write EOD", [self.logger SensitiveNSObject:[self getIdentifier]]];
            [self.writeQ add:^{
                [self.logger d:@"writeToCharacteristic: device=%@ writing EOD", [self.logger SensitiveNSObject:[self getIdentifier]]];
                [self.peripheral writeValue:[@"EOD" dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
            } withCallback:^(NSError *error){
                [self.logger d:@"writeToCharacteristic: device=%@: callback called for EOD", [self.logger SensitiveNSObject:[self getIdentifier]]];
                success = error == nil ? 1 : 0;
                dispatch_semaphore_signal(sema);
            } withDelay:0];
            
            dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
            dispatch_release(sema);
        }
        
        return success;
    }
}

- (BOOL)readToCharacteristic:(CBCharacteristic *) characteristic {
    [self.logger d:@"readToCharacteristic called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        [self.logger e:@"readToCharacteristic error: device=%@ is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return FALSE;
    }
    
    __block BOOL success = FALSE;
    CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
    
    [self.writeQ add:^{
        [self.logger d:@"readToCharacteristic: device=%@: in queue", [self.logger SensitiveNSObject:[self getIdentifier]]];
        
        if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
            [self.logger e:@"readToCharacteristic: device=%@ is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
            success = FALSE;
            [countDownLatch countDown];
            return ;
        }
        
        [self.peripheral readValueForCharacteristic:characteristic];
    } withCallback:^(NSError *error){
        if (error == nil) {
            [self.logger d:@"readToCharacteristic: device=%@: callback called with success", [self.logger SensitiveNSObject:[self getIdentifier]]];
            success = TRUE;
        } else {
            [self.logger e:@"readToCharacteristic error: device=%@ error=%@ in callback", [self.logger SensitiveNSObject:[self getIdentifier]], error];
            success = FALSE;
        }
        [countDownLatch countDown];
    } withDelay:0];
    
    [countDownLatch await];
    [countDownLatch release];
    
    return success;
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    [self.writeQ completedTask:error];
    
    if (error) {
        [self.logger e:@"didUpdateNotificationStateForCharacteristic error: device=%@ characteristic=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [characteristic.UUID UUIDString], error];
        [self.manager disconnect:self];
        return;
    }
    
    self.peer = [self.manager.peerManager registerDevice:self withPeerID:self.remotePeerID isClient:TRUE];
    if (self.peer == nil) {
        [self.logger e:@"didUpdateNotificationStateForCharacteristic error: device=%@: registerDevice failed", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager disconnect:self];
    } else {
        [self.logger d:@"didUpdateNotificationStateForCharacteristic: device=%@: registerDevice successed", [self.logger SensitiveNSObject:[self getIdentifier]]];
    }
}

// Called when the value of the characteristic changed, whether by readValueForCharacteristic: or by a notification after a subscription
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    [self.logger d:@"didUpdateValueForCharacteristic called: device=%@ characteristic=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [characteristic.UUID UUIDString]];
    
    if (error) {
        [self.logger e:@"didUpdateValueForCharacteristic error: device=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], error];
        [self.manager disconnect:self];
        [self.writeQ completedTask:error];
        return;
    }
    
    if ([characteristic.UUID isEqual:self.manager.peerUUID]) {
        if (characteristic.value != nil) {
            int psm;
            [[characteristic.value subdataWithRange:NSMakeRange(0, 4)] getBytes:&psm length:sizeof(psm)];
            self.psm = NSSwapBigIntToHost(psm);
            NSString* remotePeerID = [NSString stringWithUTF8String: [[characteristic.value subdataWithRange:NSMakeRange(4, characteristic.value.length - 4)] bytes]];
            
            [self.logger d:@"didUpdateValueForCharacteristic: device=%@ PSM=%d remotePID=%@", [self.logger SensitiveNSObject:[self getIdentifier]], self.psm, [self.logger SensitiveNSObject:remotePeerID]];
            
            self.remotePeerID = remotePeerID;
            
            [self.writeQ completedTask:nil];
        } else {
            [self.logger e:@"didUpdateValueForCharacteristic error: device=%@: characteristic doesn't have any value", [self.logger SensitiveNSObject:[self getIdentifier]]];
            [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"Empty value"}]];
        }
    } else if ([characteristic.UUID isEqual:self.manager.writerUUID]) {
        [self handleIncomingData:characteristic.value];
    } else {
        [self.logger e:@"didUpdateValueForCharacteristic error: device=%@: bad characteristic requested", [self.logger SensitiveNSObject:[self getIdentifier]]];
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    [self.logger d:@"didWriteValueForCharacteristic called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    if (error) {
        [self.logger e:@"didWriteValueForCharacteristic error: device=%@ characteristic=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [characteristic.UUID UUIDString], error];
    }
    
    [self.writeQ completedTask:error];
}

#pragma mark - Characteristic Discovery

- (void)discoverCharacteristics:(nullable NSArray *)characteristics forService:(CBService *)service {
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        [self.logger e:@"discoverCharacteristics error: device=%@ is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager disconnect:self];
        return ;
    }
    
    [self.connectionQ add:^{
        [self.peripheral discoverCharacteristics:characteristics forService:service];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
    [self.logger d:@"didDiscoverCharacteristicsForService called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    [self.connectionQ completedTask:error];
    
    if (error) {
        [self.logger e:@"didDiscoverCharacteristicsForService error: device=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], error];
        [self.manager disconnect:self];
        return;
    }
    
    for (CBCharacteristic *chr in service.characteristics) {
        if ([chr.UUID isEqual:self.manager.peerUUID]) {
            self.peerIDCharacteristic = chr;
            [self.logger d:@"didDiscoverCharacteristicsForService: device=%@: peerID characteristic found", [self.logger SensitiveNSObject:[self getIdentifier]]];
        } else if ([chr.UUID isEqual:self.manager.writerUUID]) {
            self.writerCharacteristic = chr;
            [self.logger d:@"didDiscoverCharacteristicsForService: device=%@: writer characteristic found", [self.logger SensitiveNSObject:[self getIdentifier]]];
        }
    }
    
    if (self.peerIDCharacteristic == nil || self.writerCharacteristic == nil) {
        [self.logger e:@"didDiscoverCharacteristicsForService error: device=%@: not all characteristics found", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager disconnect:self];
        return ;
    }
    
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        [self handshake];
    });
}

#pragma mark - Services Discovery

- (void)discoverServices:(NSArray *)serviceUUIDs {
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        [self.logger e:@"discoverServices error: device=%@ is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager disconnect:self];
        return ;
    }
    
    self.peripheral.delegate = self;
    [self.connectionQ add:^{
        [self.peripheral discoverServices:serviceUUIDs];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    [self.logger d:@"didDiscoverServices called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    [self.connectionQ completedTask:error];
    
    if (error) {
        [self.logger e:@"didDiscoverServices error: device=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], error];
        [self.manager disconnect:self];
        return;
    }

    CBService *service = getService(self.peripheral.services, [self.manager.serviceUUID UUIDString]);
    if (service == nil) {
        [self.logger e:@"didDiscoverServices error: device=%@: service not found", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.manager disconnect:self];
        return;
    }
    [self discoverCharacteristics:@[self.manager.peerUUID, self.manager.writerUUID,] forService:service];
}

#pragma mark - L2cap

- (BOOL) negotiateL2cap {
    [self.logger d:@"negotiateL2cap called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        [self.logger e:@"negotiateL2cap error: device=%@ is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return FALSE;
    }
    
    __block BOOL success = FALSE;
    CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
    
    if (@available(iOS 11.0, *)) {
        if (self.psm != 0) {
            [self.connectionQ add:^{
                [self.logger d:@"negotiateL2cap: device=%@: opening L2cap channel", [self.logger SensitiveNSObject:[self getIdentifier]]];
                [self.peripheral openL2CAPChannel:self.psm];
            } withCallback:^(NSError *error){
                if (error == nil) {
                    [self.logger d:@"negotiateL2cap: device=%@: callback called with success", [self.logger SensitiveNSObject:[self getIdentifier]]];
                    success = TRUE;
                } else {
                    [self.logger e:@"negotiateL2cap error: device=%@ error=%@ in callback", [self.logger SensitiveNSObject:[self getIdentifier]], error];
                    success = FALSE;
                }
                [countDownLatch countDown];
            } withDelay:0];
            
            [countDownLatch await];
            [countDownLatch release];
        } else {
            [self.logger d:@"negotiateL2cap: device=%@: central peripheral doesn't support L2CAP, aborting negotation", [self.logger SensitiveNSObject:[self getIdentifier]]];
            success = TRUE; // return TRUE to continue connection without L2cap
        }
    } else {
        [self.logger d:@"negotiateL2cap: device=%@: iOS 11+ is required", [self.logger SensitiveNSObject:[self getIdentifier]]];
        success = TRUE; // return TRUE to continue connection without L2cap
    }
    
    return success;
}

- (BOOL)l2capWrite:(NSData *__nonnull)data {
    __block BOOL success = FALSE;
    
    if (self.l2capChannel != nil) {
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);
        
        [self.writeQ add:^{
            @synchronized (self.writerLatch) {
                [self.logger d:@"l2capWrite: device=%@ len=%lu base64=%@", [self.logger SensitiveNSObject:[self getIdentifier]], [data length], [self.logger SensitiveNSObject:[data base64EncodedStringWithOptions:0]]];
                if ([self.logger showSensitiveData]) {
                    [BleManager printLongLog:[BleManager NSDataToHex:data]];
                }
                
                self.l2capWriteIndex = 0;
                self.l2capWriteData = data;
                if ([self.l2capChannel.outputStream hasSpaceAvailable]) {
                    uint8_t *readBytes = (uint8_t *)[self.l2capWriteData bytes];
                    NSUInteger data_len = [data length];
                    NSUInteger len = (data_len >= L2CAP_BUFFER) ? L2CAP_BUFFER : (data_len);
                    uint8_t buf[len];
                    
                    (void)memcpy(buf, readBytes, len);
                    
                    self.l2capWriteIndex = [self.l2capChannel.outputStream write:(const uint8_t *)buf maxLength:len];
                    [self.logger d:@"l2capWrite: device=%@: wrote len=%zd", [self.logger SensitiveNSObject:[self getIdentifier]], self.l2capWriteIndex];
                    
                    if (self.l2capWriteIndex == -1) {
                        [self.logger e:@"l2capWrite error: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]], self.l2capWriteIndex];
                        
                        self.l2capWriteData = nil;
                        [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"write error"}]];
                        return ;
                    }
                    
                    if (self.l2capWriteIndex < data_len) { // write next data chunk when callback stream handleEvent: NSStreamEventHasSpaceAvailable is called
                        [self.logger d:@"l2capWrite: device=%@: write completed but need more write space to send all data, waiting...", [self.logger SensitiveNSObject:[self getIdentifier]], self.l2capWriteIndex];
                    } else {
                        [self.logger d:@"l2capWrite: device=%@: write completed and all data send", [self.logger SensitiveNSObject:[self getIdentifier]]];
                        
                        self.l2capWriteData = nil;
                        [self.writeQ completedTask:nil];
                    }
                } else {
                    [self.logger d:@"l2capWrite: device=%@: need some space available, waiting...", [self.logger SensitiveNSObject:[self getIdentifier]]];
                }
            }
        } withCallback:^(NSError *error) {
            if (error == nil) {
                [self.logger d:@"l2capWrite: device=%@: callback called with success", [self.logger SensitiveNSObject:[self getIdentifier]]];
                success = TRUE;
            } else {
                [self.logger e:@"l2capWrite error: device=%@ error=%@ in callback", [self.logger SensitiveNSObject:[self getIdentifier]], error];
                success = FALSE;
            }
            dispatch_semaphore_signal(sema);
        } withDelay:0];
        
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
        dispatch_release(sema);
        
        return success;
    } else {
        [self.logger e:@"l2capWrite error: device=%@: channel not set", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return FALSE;
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didOpenL2CAPChannel:(CBL2CAPChannel *)channel error:(NSError *)error API_AVAILABLE(ios(11.0)) {
    [self.logger d:@"didOpenL2CAPChannel called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    if (error != nil) {
        [self.logger e:@"didOpenL2CAPChannel Error: device=%@ error=%@", [self.logger SensitiveNSObject:[self getIdentifier]], error];
        [self.connectionQ completedTask:error];
        return ;
    }
    
    self.l2capChannel = channel;
    
    self.l2capThread = [[NSThread alloc] initWithTarget:self selector:@selector(setupL2capStreams) object:nil];
    [self.l2capThread start];

    self.l2capClientHandshakeRunning = TRUE;
    self.useL2cap = [self testL2cap];
    self.l2capClientHandshakeRunning = FALSE;
    
    // wait that server complete L2CAP tests
    [NSThread sleepForTimeInterval:2.0f];
    
    [self.connectionQ completedTask:nil];
}

- (void)setupL2capStreams {
    [self.logger d:@"setupL2capStreams called: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
    
    self.l2capChannel.inputStream.delegate = self;
    [self.l2capChannel.inputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [self.l2capChannel.inputStream open];
    self.l2capChannel.outputStream.delegate = self;
    [self.l2capChannel.outputStream scheduleInRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
    [self.l2capChannel.outputStream open];
    
    @autoreleasepool {
        do {
            [[NSRunLoop currentRunLoop] run];
        } while (self.peer != nil && [self.peer isConnected]);
    }
}

- (NSMutableData *__nonnull)createRandomNSData:(int) capacity
{
    NSMutableData* theData = [NSMutableData dataWithCapacity:capacity];
    
    for (unsigned int i = 0 ; i < capacity / 4 ; ++i ) {
        u_int32_t randomBits = arc4random();
        [theData appendBytes:(void *)&randomBits length:4];
    }
    return theData;
}

// Test contains 2 steps:
// 1) client sends local PID and waits for receiving remote PID
// 2) client sends remote PID in response of 1) to the server
- (BOOL)testL2cap {
    self.l2capHandshakeStepStatus = FALSE;
    self.l2capHandshakeRecvData = [NSMutableData dataWithCapacity:L2CAP_HANDSHAKE_DATA];
    self.l2capHandshakeLatch = [[CountDownLatch alloc] initCount:1];
    
    self.l2capHandshakeBlock = dispatch_block_create(DISPATCH_BLOCK_INHERIT_QOS_CLASS, ^{
        [self.logger e:@"testL2cap: device=%@: timout hired", [self.logger SensitiveNSObject:[self getIdentifier]]];
        [self.l2capHandshakeLatch countDown];
    });
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), self.l2capHandshakeBlock);
    
    // step 1
    [self.logger d:@"testL2cap: device=%@: client going to write the 1st payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
    self.l2capHandshakeData = [self createRandomNSData:L2CAP_HANDSHAKE_DATA];
    if (![self l2capWrite:self.l2capHandshakeData]) {
        [self.logger e:@"testL2cap error: device=%@: client write error", [self.logger SensitiveNSObject:[self getIdentifier]]];
        dispatch_block_cancel(self.l2capHandshakeBlock);
        self.l2capHandshakeData = nil;
        self.l2capHandshakeRecvData = nil;
        return FALSE;
    }
    
    // waiting for receiving remote PID
    [self.l2capHandshakeLatch await];
    self.l2capHandshakeData = nil;
    self.l2capHandshakeRecvData = nil;
    
    // step 2
    if (self.l2capHandshakeStepStatus) {
        [self.logger d:@"testL2cap: device=%@: client going to write the 2nd payload", [self.logger SensitiveNSObject:[self getIdentifier]]];
        if (![self l2capWrite:[self.remotePeerID dataUsingEncoding:NSUTF8StringEncoding]]) {
            [self.logger e:@"testL2cap error: device=%@: client write error", [self.logger SensitiveNSObject:[self getIdentifier]]];
            return FALSE;
        }
        
        [self.logger d:@"testL2cap: device=%@: client handshake completed", [self.logger SensitiveNSObject:[self getIdentifier]]];
        return TRUE;
    }
    
    return FALSE;
}

- (void)stream:(NSStream *)stream handleEvent:(NSStreamEvent)eventCode {
    switch(eventCode) {
        case NSStreamEventNone: {
            [self.logger d:@"stream handleEvent: NSStreamEventNone: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
            break;
        }
        case NSStreamEventOpenCompleted: {
            [self.logger d:@"stream handleEvent: NSStreamEventOpenCompleted: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
            break;
        }
        case NSStreamEventHasBytesAvailable: {
            [self.logger d:@"stream handleEvent: NSStreamEventHasBytesAvailable: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];

            uint8_t buf[L2CAP_BUFFER];

            NSInteger len = 0;

            len = [(NSInputStream *)stream read:buf maxLength:L2CAP_BUFFER];

            if(len > 0) {
                NSData *received = [NSData dataWithBytes:buf length:len];
                [self.logger d:@"stream handleEvent: NSStreamEventHasBytesAvailable: device=%@ read length=%lu value=%@", [self.logger SensitiveNSObject:[self getIdentifier]], len, [self.logger SensitiveNSObject:received]];
                [self handleIncomingData:received];
            } else {
                [self.logger e:@"stream handleEvent error: NSStreamEventHasBytesAvailable: device=%@: nothing to read", [self.logger SensitiveNSObject:[self getIdentifier]]];
            }
            
            break;
        }
        case NSStreamEventHasSpaceAvailable: {
            [self.logger d:@"stream handleEvent: NSStreamEventHasSpaceAvailable: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
            
            if ((self.peer != nil && [self.peer isConnected]) || self.l2capServerHandshakeRunning || self.l2capClientHandshakeRunning) {
                @synchronized (self.writerLatch) {
                    if (self.l2capWriteData != nil) {
                        uint8_t *readBytes = (uint8_t *)[self.l2capWriteData bytes];
                        readBytes += self.l2capWriteIndex;
                        NSUInteger data_len = [self.l2capWriteData length];
                        NSUInteger len = ((data_len - self.l2capWriteIndex >= L2CAP_BUFFER) ? L2CAP_BUFFER : (data_len - self.l2capWriteIndex));
                        uint8_t buf[len];

                        (void)memcpy(buf, readBytes, len);

                        if ([self.logger showSensitiveData]) {
                            [self.logger d:@"stream handleEvent: NSStreamEventHasSpaceAvailable: device=%@ offset=%lu len=%lu base64=%@ data=%@", [self getIdentifier], self.l2capWriteIndex, len, [[NSData dataWithBytes:buf length:len] base64EncodedStringWithOptions:0], [BleManager NSDataToHex:[NSData dataWithBytes:buf length:len]]];
                        }
                        NSInteger wroteLen = [(NSOutputStream *)stream write:(const uint8_t *)buf maxLength:len];
                        [self.logger d:@"stream handleEvent: NSStreamEventHasSpaceAvailable: device=%@ wrote data offset=%lu len=%zd", [self.logger SensitiveNSObject:[self getIdentifier]], self.l2capWriteIndex, wroteLen];
                        
                        if (wroteLen == -1) {
                            [self.logger e:@"stream handleEvent error: NSStreamEventHasSpaceAvailable: device=%@ write: error", [self.logger SensitiveNSObject:[self getIdentifier]]];
                            self.l2capWriteData = nil;
                            [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"write error"}]];
                            
                            break;
                        }
                        
                        self.l2capWriteIndex += wroteLen;
                        if ([self.l2capWriteData length] == self.l2capWriteIndex) {
                            [self.logger d:@"stream handleEvent: NSStreamEventHasSpaceAvailable: device=%@: write completed", [self.logger SensitiveNSObject:[self getIdentifier]]];

                            self.l2capWriteData = nil;
                            [self.writeQ completedTask:nil];
                        }
                    } else {
                        [self.logger d:@"stream handleEvent: NSStreamEventHasSpaceAvailable: device=%@: no data to write", [self.logger SensitiveNSObject:[self getIdentifier]]];
                    }
                }
            } else {
                [self.logger e:@"stream handleEvent error: NSStreamEventHasSpaceAvailable: device=%@: device is not connected", [self.logger SensitiveNSObject:[self getIdentifier]]];
            }
            
            break;
        }
        case NSStreamEventErrorOccurred: {
            [self.logger d:@"stream handleEvent: NSStreamEventErrorOccurred: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];
            
            [self.manager disconnect:self];
            break;
        }
        case NSStreamEventEndEncountered: { // (d4ryl00): not sure how to handle this case
            [self.logger d:@"stream handleEvent: NSStreamEventEndEncountered: device=%@", [self.logger SensitiveNSObject:[self getIdentifier]]];

            if (self.l2capChannel.outputStream == stream) {
                NSData *newData = [stream propertyForKey:NSStreamDataWrittenToMemoryStreamKey];

                if (!newData) {
                    [self.logger d:@"stream handleEvent: NSStreamEventEndEncountered: device=%@: no more data", [self.logger SensitiveNSObject:[self getIdentifier]]];
                } else {
                    [self.logger d:@"stream handleEvent: NSStreamEventEndEncountered: device=%@: data to process", [self.logger SensitiveNSObject:[self getIdentifier]]];
                    [self handleIncomingData:newData];
                }
            }

            stream.delegate = nil;
            [stream close];
            [stream removeFromRunLoop:[NSRunLoop currentRunLoop] forMode:NSDefaultRunLoopMode];
            if (self.l2capThread != nil) {
                [self.l2capThread cancel];
                [self.l2capThread release];
                self.l2capThread = nil;
            }

            [self.manager disconnect:self];
            
            break;
        }
    }
}

@end
