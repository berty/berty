// +build darwin
//
//  BertyDevice.m
//  ble
//
//  Created by sacha on 03/06/2019.
//  Copyright © 2019 berty. All rights reserved.
//

#import <os/log.h>

#import "BleInterface_darwin.h"
#import "BertyDevice_darwin.h"
#import "CircularQueue.h"
#import "PeerManager.h"
#import "ConnectedPeer.h"
#import "CountDownLatch_darwin.h"

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

- (instancetype)initWithPeripheral:(CBPeripheral *)peripheral
                           central:(BleManager *)manager withName:(NSString *__nonnull)name {
    self = [self initWithIdentifier:[peripheral.identifier UUIDString] central:manager asClient:TRUE];
    
    if (self) {
        _peripheral = [peripheral retain];
        _name = name;
    }
    
    return self;
}

- (instancetype)initWithIdentifier:(NSString *)identifier central:(BleManager *)manager asClient:(BOOL)client{
    self = [super init];
    
    if (self) {
        if (client) {
            _clientSideIdentifier = [identifier retain];
        } else {
            _serverSideIdentifier = [identifier retain];
        }
        
        _peripheral = nil;
        _manager = manager;
        _remotePeerID = nil;
        _psm = 0;
        
        _connectionQ = [[BleQueue alloc] init: dispatch_get_main_queue()];
        _writeQ = [[BleQueue alloc] init: dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)];
        _readQ = [[BleQueue alloc] init: dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)];
        
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
    os_log_debug(OS_LOG_BLE, "🟢 closeL2cap: device=%{public}@", [self getIdentifier]);
    
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
        os_log_debug(OS_LOG_BLE, "🟢 closeBertyDevice: device=%{public}@", [self getIdentifier]);
        
        if (!self.isDisconnecting) {
            self.isDisconnecting = TRUE;
            
            [self.connectionQ clear];
            [self.writeQ clear];
            [self.readQ clear];
            
            [self closeL2cap];
            if (self.peer != nil) {
                [PeerManager unregisterDevice:self];
                self.peer = nil;
            }
        } else {
            os_log_debug(OS_LOG_BLE, "🟢 closeBertyDevice: device=%{public}@ is already disconnecting", [self getIdentifier]);
        }
        self.isDisconnecting = FALSE;
    }
}

- (BOOL)handlePeerID:(NSData *__nonnull)peerIDData {
    if (self.peer != nil && [self.peer isConnected]) {
        os_log_error(OS_LOG_BLE, "handlePeerID: device=%{public}@: peer already connected", [self getIdentifier]);
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
        os_log_debug(OS_LOG_BLE, "handlePeerID: device=%{public}@: current peerID=%{public}@, new peerID=%{public}@", [self getIdentifier], self.remotePeerID, remotePeerID);
        self.remotePeerID = remotePeerID;
    } else {
        @synchronized (tmpData) {
            os_log_debug(OS_LOG_BLE, "handlePeerID: device=%{public}@: add to buffer data=%{public}@", [self getIdentifier], peerIDData);
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
        os_log_error(OS_LOG_BLE, "putIncomingDataInCache: device=%{public}@: cannot add data in cache", [self getIdentifier]);
        return FALSE;
    }
    return TRUE;
}

- (BOOL)handleIncomingData:(NSData *__nonnull)data {
    os_log_debug(OS_LOG_BLE, "handleIncomingData() identifier=%{public}@ len=%lu base64=%{public}@", [self getIdentifier], [data length], [data base64EncodedStringWithOptions:0]);
    [BleManager printLongLog:[BleManager NSDataToHex:data]];
    
    if (self.l2capClientHandshakeRunning) {
        [self.l2capHandshakeRecvData appendBytes:data length:[data length]];
        if ([self.l2capHandshakeRecvData length] < L2CAP_HANDSHAKE_DATA) {
            os_log_debug(OS_LOG_BLE, "handleIncomingData: device=%{public}@: client handshake received incompleted payload: length=%lu", [self getIdentifier], [self.l2capHandshakeRecvData length]);
        } else if ([self.l2capHandshakeRecvData length] == L2CAP_HANDSHAKE_DATA) {
            if ([data isEqualToData:self.l2capHandshakeData]) {
                os_log_debug(OS_LOG_BLE, "handleIncomingData: device=%{public}@: client handshake received payload", [self getIdentifier]);
                self.l2capHandshakeStepStatus = TRUE;
                dispatch_block_cancel(self.l2capHandshakeBlock);
                [self.l2capHandshakeLatch countDown];
            } else {
                os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: client handshake received wrong payload", [self getIdentifier]);
                dispatch_block_cancel(self.l2capHandshakeBlock);
                [self.l2capHandshakeLatch countDown];
                [self.manager disconnect:self];
            }
        } else {
            os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: client handshake received bigger payload than expected: length=%lu", [self getIdentifier], [self.l2capHandshakeRecvData length]);
        }
    } else if (self.l2capServerHandshakeRunning) {
        if (!self.l2capHandshakeStepStatus) {
            os_log_debug(OS_LOG_BLE, "handleIncomingData: device=%{public}@: server handshake received payload, going to write it back", [self getIdentifier]);
            
            // the server side needs to know when it receives all 1st step data, so it must count data len
            self.l2capHandshakeRecvDataLen += [data length];
            if (self.l2capHandshakeRecvDataLen == L2CAP_HANDSHAKE_DATA) {
                self.l2capHandshakeStepStatus = TRUE;
                self.l2capHandshakeRecvDataLen = 0;
            }
            
            if (![self l2capWrite:data]) {
                os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: server handshake write error", [self getIdentifier]);
                self.l2capServerHandshakeRunning = FALSE;
                self.l2capHandshakeStepStatus = FALSE;
            }
        } else if ([data isEqualToData:[self.manager.localPID dataUsingEncoding:NSUTF8StringEncoding]]) {
            os_log_debug(OS_LOG_BLE, "handleIncomingData: device=%{public}@: server handshake received second payload", [self getIdentifier]);
            self.l2capServerHandshakeRunning = FALSE;
            self.useL2cap = TRUE;
        } else {
            os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: server handshake received wrong payload", [self getIdentifier]);
        }
    } else {
        if (!self.peer) {
            os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: peer not existing", [self getIdentifier]);
            return [self putIncomingDataInCache:data];
        }
        
        if (![self.peer isConnected]) {
            os_log(OS_LOG_BLE, "handleIncomingData: device=%{public}@: peer not connected, put data in cache", [self getIdentifier]);
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

- (BOOL) setNotifyValue {
    if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
        os_log_debug(OS_LOG_BLE, "handshake: going to subscribe to writer notifications");
        [self.writeQ add:^{
            if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
                os_log_debug(OS_LOG_BLE, "handshake: subscribe to writer notifications");
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
    os_log_debug(OS_LOG_BLE, "🟢 didModifyServices() with invalidated %{public}@", invalidatedServices);
    
    [self.manager disconnect:self];
}

- (void)handleConnect:(NSError *)error {
    [self.connectionQ completedTask:error];
    
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 handleConnect() device %{public}@ connection failed %{public}@", [self getIdentifier], error);
        [self.manager disconnect:self];
        return;
    }
    
    os_log_debug(OS_LOG_BLE, "🟢 handleConnect() device %{public}@ connection succeed", [self getIdentifier]);
    [self discoverServices:@[self.manager.serviceUUID]];
}

- (void)connectWithOptions:(NSDictionary *)options {
    os_log_debug(OS_LOG_BLE, "connectWithOptions called: identifier=%{public}@", [self getIdentifier]);
    [self.connectionQ add:^{
        os_log_debug(OS_LOG_BLE, "connectWithOptions: processing in queue: identifier=%{public}@", [self getIdentifier]);
        [self.manager.cManager connectPeripheral:self.peripheral options:nil];
    } withCallback:nil withDelay:0];
}

#pragma mark - write functions

- (void)flushCache {
    os_log_debug(OS_LOG_BLE, "flushCache called: identifier=%{public}@", [self getIdentifier]);
    
    while ([self.dataCache element] != [NSNull null]) {
        NSData *data = [[self.dataCache poll] retain];
        os_log_debug(OS_LOG_BLE, "flushCache: identifier=%{public}@ base64=%{public}@ data=%{public}@", [self getIdentifier], [data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:data]);
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
        os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ base64=%{public}@", [self getIdentifier], [data base64EncodedStringWithOptions:0]);
        [BleManager printLongLog:[BleManager NSDataToHex:data]];
        
        __block BOOL success = FALSE;
        NSData *toSend = nil;
        self.remainingData = data;
        
        while (self.remainingData.length > 0) {
            if (self.peripheral != nil && self.peripheral.state == CBPeripheralStateConnected) {
                toSend = [[self getDataToSend] retain];
                CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
                
                os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ going to write payload=%{public}@", [self getIdentifier], toSend);
                [self.writeQ add:^{
                    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
                        os_log_error(OS_LOG_BLE, "writeToCharacteristic error: device=%{public}@ is not connected", [self getIdentifier]);
                        success = FALSE;
                        [countDownLatch countDown];
                        return ;
                    }
                    
                    os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ writing base64=%{public}@ data=%{public}@", [self getIdentifier], [toSend base64EncodedStringWithOptions:0], [BleManager NSDataToHex:toSend]);
                    [self.peripheral writeValue:toSend forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
                } withCallback:^(NSError *error){
                    os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ callback for payload=%{public}@ status=%{public}@", [self getIdentifier], toSend, error);
                    success = error == nil ? TRUE : FALSE;
                    [countDownLatch countDown];
                } withDelay:0];
                
                [countDownLatch await];
                [countDownLatch release];
                
                [toSend release];
                
                // don't write EOD is error occured
                if (!success) {
                    os_log_error(OS_LOG_BLE, "writeToCharacteristic error: identifier=%{public}@: cancel", [self getIdentifier]);
                    return FALSE;
                }
            } else {
                os_log_error(OS_LOG_BLE, "writeToCharacteristic error: device=%{public}@ not connected", [self getIdentifier]);
                return FALSE;
            }
        }
        
        if (eod) {
            dispatch_semaphore_t sema = dispatch_semaphore_create(0);
            
            os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ going to write payload=EOD", [self getIdentifier]);
            [self.writeQ add:^{
                os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ writing payload=EOD", [self getIdentifier]);
                [self.peripheral writeValue:[@"EOD" dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
            } withCallback:^(NSError *error){
                os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ callback for payload=EOD", [self getIdentifier]);
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
    os_log_debug(OS_LOG_BLE, "readToCharacteristic: identifier=%{public}@: called", [self getIdentifier]);
    
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        os_log_error(OS_LOG_BLE, "readToCharacteristic error: device=%{public}@ is not connected", [self getIdentifier]);
        return FALSE;
    }
    
    __block BOOL success = FALSE;
    CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
    
    [self.writeQ add:^{
        os_log_debug(OS_LOG_BLE, "readToCharacteristic: identifier=%{public}@: in queue", [self getIdentifier]);
        
        if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
            os_log_error(OS_LOG_BLE, "readToCharacteristic error: device=%{public}@ is not connected", [self getIdentifier]);
            success = FALSE;
            [countDownLatch countDown];
            return ;
        }
        
        [self.peripheral readValueForCharacteristic:characteristic];
    } withCallback:^(NSError *error){
        os_log_debug(OS_LOG_BLE, "readToCharacteristic: identifier=%{public}@ callback for status=%{public}@", [self getIdentifier], error);
        success = error == nil ? TRUE : FALSE;
        [countDownLatch countDown];
    } withDelay:0];
    
    [countDownLatch await];
    [countDownLatch release];
    
    return success;
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    [self.writeQ completedTask:error];
    
    if (error) {
        os_log_error(OS_LOG_BLE, "didUpdateNotificationStateForCharacteristic error: device=%{public}@ characteristic=%{public}@ status=%{public}@", [self getIdentifier], [characteristic.UUID UUIDString], error);
        [self.manager disconnect:self];
        return;
    }
    
    self.peer = [PeerManager registerDevice:self withPeerID:self.remotePeerID isClient:TRUE];
    if (self.peer == nil) {
        os_log_error(OS_LOG_BLE, "didUpdateNotificationStateForCharacteristic: identifier=%{public}@ registerDevice failed", [self getIdentifier]);
        [self.manager disconnect:self];
    } else {
        os_log_debug(OS_LOG_BLE, "didUpdateNotificationStateForCharacteristic: identifier=%{public}@ registerDevice successed", [self getIdentifier]);
    }
}

// Called when the value of the characteristic changed, whether by readValueForCharacteristic: or by a notification after a subscription
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    os_log_debug(OS_LOG_BLE, "didUpdateValueForCharacteristic called: identifier=%{public}@", [[peripheral identifier] UUIDString]);
    
    if (error) {
        os_log_error(OS_LOG_BLE, "didUpdateValueForCharacteristic() device %{public}@ read failed characteristic=%{public}@ status=%{public}@", [self getIdentifier], [characteristic.UUID UUIDString], error);
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
            
            os_log_debug(OS_LOG_BLE, "didUpdateValueForCharacteristic: identifier=%{public}@ PSM=%d remotePID=%{public}@", [[peripheral identifier] UUIDString], self.psm, remotePeerID);
            
            self.remotePeerID = remotePeerID;
            
            [self.writeQ completedTask:nil];
        } else {
            os_log_debug(OS_LOG_BLE, "didUpdateValueForCharacteristic: peerID characteristic error: %@", error);
            [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"Empty value"}]];
        }
    } else if ([characteristic.UUID isEqual:self.manager.writerUUID]) {
        [self handleIncomingData:characteristic.value];
    } else {
        os_log_debug(OS_LOG_BLE, "didUpdateValueForCharacteristic: bad characteristic");
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    os_log_debug(OS_LOG_BLE, "didWriteValueForCharacteristic called: device=%{public}@", [self getIdentifier]);
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 didWriteValueForCharacteristic() device %{public}@ write failed characteristic=%{public}@ status=%{public}@", [self getIdentifier], [characteristic.UUID UUIDString], error);
    }
    
    [self.writeQ completedTask:error];
}

#pragma mark - Characteristic Discovery

- (void)discoverCharacteristics:(nullable NSArray *)characteristics forService:(CBService *)service {
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        os_log_error(OS_LOG_BLE, "discoverCharacteristics error: device=%{public}@ is not connected", [self getIdentifier]);
        [self.manager disconnect:self];
        return ;
    }
    
    [self.connectionQ add:^{
        [self.peripheral discoverCharacteristics:characteristics forService:service];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
    [self.connectionQ completedTask:error];
    
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverCharacteristicsForService() device %{public}@ discover characteristic failed: %{public}@", [self getIdentifier], error);
        [self.manager disconnect:self];
        return;
    }
    
    os_log_debug(OS_LOG_BLE, "🟢 didDiscoverCharacteristicsForService() device %{public}@ discover characteristic succeed", [self getIdentifier]);
    
    for (CBCharacteristic *chr in service.characteristics) {
        if ([chr.UUID isEqual:self.manager.peerUUID]) {
            self.peerIDCharacteristic = chr;
            os_log_debug(OS_LOG_BLE, "🟢 didDiscoverCharacteristicsForService() peerID characteristic found");
        } else if ([chr.UUID isEqual:self.manager.writerUUID]) {
            self.writerCharacteristic = chr;
            os_log_debug(OS_LOG_BLE, "🟢 didDiscoverCharacteristicsForService() writer characteristic found");
        }
    }
    
    if (self.peerIDCharacteristic == nil || self.writerCharacteristic == nil) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverCharacteristicsForService() characteristic not found");
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
        os_log_error(OS_LOG_BLE, "discoverServices error: device=%{public}@ is not connected", [self getIdentifier]);
        [self.manager disconnect:self];
        return ;
    }
    
    self.peripheral.delegate = self;
    [self.connectionQ add:^{
        [self.peripheral discoverServices:serviceUUIDs];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    [self.connectionQ completedTask:error];
    
    if (error) {
        os_log_error(OS_LOG_BLE, "🔴 didDiscoverServices() device %{public}@ discover service failed: %{public}@", [self getIdentifier], error);
        [self.manager disconnect:self];
        return;
    }
    os_log_debug(OS_LOG_BLE, "🟢 didDiscoverServices() device %{public}@ service discover succeed", [self getIdentifier]);
    CBService *service = getService(self.peripheral.services, [self.manager.serviceUUID UUIDString]);
    
    if (service == nil) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverServices() service not found");
        [self.manager disconnect:self];
        return;
    }
    [self discoverCharacteristics:@[self.manager.peerUUID, self.manager.writerUUID,] forService:service];
}

#pragma mark - L2cap

- (BOOL) negotiateL2cap {
    os_log_debug(OS_LOG_BLE, "negotiateL2cap: identifier=%{public}@: called", [self getIdentifier]);
    
    if (self.peripheral == nil || self.peripheral.state != CBPeripheralStateConnected) {
        os_log_error(OS_LOG_BLE, "discoverServices error: device=%{public}@ is not connected", [self getIdentifier]);
        return FALSE;
    }
    
    __block BOOL success = FALSE;
    CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:1];
    
    if (@available(iOS 11.0, *)) {
        if (self.psm != 0) {
            [self.connectionQ add:^{
                os_log_debug(OS_LOG_BLE, "negotiateL2cap: identifier=%{public}@: in queue", [self getIdentifier]);
                [self.peripheral openL2CAPChannel:self.psm];
            } withCallback:^(NSError *error){
                os_log_debug(OS_LOG_BLE, "negotiateL2cap: identifier=%{public}@ callback for status=%{public}@", [self getIdentifier], error);
                success = error == nil ? TRUE : FALSE;
                [countDownLatch countDown];
            } withDelay:0];
            
            [countDownLatch await];
            [countDownLatch release];
        } else {
            os_log(OS_LOG_BLE, "negotiateL2cap: central peripheral doesn't support L2CAP, aborting negotation");
            success = TRUE;
        }
    } else {
        os_log_debug(OS_LOG_BLE, "negotiateL2cap: iOS 11+ is required");
        success = TRUE;
    }
    
    return success;
}

- (BOOL)l2capWrite:(NSData *__nonnull)data {
    __block BOOL success = FALSE;
    
    if (self.l2capChannel != nil) {
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);
        
        [self.writeQ add:^{
            @synchronized (self.writerLatch) {
                os_log_debug(OS_LOG_BLE, "l2capWrite() identifier=%{public}@ thread=%d len=%lu base64=%{public}@", [self getIdentifier], [self.l2capThread isExecuting], [data length], [data base64EncodedStringWithOptions:0]);
                [BleManager printLongLog:[BleManager NSDataToHex:data]];
//                os_log_debug(OS_LOG_BLE, "l2capWrite() data=%{public}@", [BleManager NSDataToHex:data]);
                
                self.l2capWriteIndex = 0;
                self.l2capWriteData = data;
                if ([self.l2capChannel.outputStream hasSpaceAvailable]) {
                    uint8_t *readBytes = (uint8_t *)[self.l2capWriteData bytes];
                    NSUInteger data_len = [data length];
                    NSUInteger len = (data_len >= L2CAP_BUFFER) ? L2CAP_BUFFER : (data_len);
                    uint8_t buf[len];
                    
                    (void)memcpy(buf, readBytes, len);
                    
                    self.l2capWriteIndex = [self.l2capChannel.outputStream write:(const uint8_t *)buf maxLength:len];
                    os_log_debug(OS_LOG_BLE, "l2capWrite: identifier=%{public}@ wrote data len=%zd", [self getIdentifier], self.l2capWriteIndex);
                    
                    if (self.l2capWriteIndex == -1) {
                        os_log_error(OS_LOG_BLE, "🔴 l2capWrite error: device=%{public}@", [self getIdentifier]);
                        
                        self.l2capWriteData = nil;
                        [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"write error"}]];
                        return ;
                    }
                    
                    if (self.l2capWriteIndex < data_len) { // write next data chunk when callback stream handleEvent: NSStreamEventHasSpaceAvailable is called
                        os_log_debug(OS_LOG_BLE, "l2capWrite: device=%{public}@: need more write to send all data", [self getIdentifier]);
                    } else {
                        os_log_debug(OS_LOG_BLE, "l2capWrite: device=%{public}@: write completed", [self getIdentifier]);
                        
                        self.l2capWriteData = nil;
                        [self.writeQ completedTask:nil];
                    }
                } else {
                    os_log_debug(OS_LOG_BLE, "l2capWrite: device=%{public}@: need space available, waiting...", [self getIdentifier]);
                }
            }
        } withCallback:^(NSError *error) {
            os_log_debug(OS_LOG_BLE, "l2capWrite: identifier=%{public}@ callback called", [self getIdentifier]);
            success = error == nil ? 1 : 0;
            dispatch_semaphore_signal(sema);
        } withDelay:0];
        
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
        dispatch_release(sema);
        
        return success;
    } else {
        os_log_error(OS_LOG_BLE, "l2capWrite error: identifier=%{public}@): channel not set", [self getIdentifier]);
        return FALSE;
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didOpenL2CAPChannel:(CBL2CAPChannel *)channel error:(NSError *)error API_AVAILABLE(ios(11.0)) {
    os_log_debug(OS_LOG_BLE, "🟢 didOpenL2CAPChannel called: device=%{public}@", [self getIdentifier]);
    if (error != nil) {
        os_log_error(OS_LOG_BLE, "🔴 didOpenL2CAPChannel error=%{public}@ device=%{public}@", error, [self getIdentifier]);
        // Don't disconnect if L2cap channel isn't started
        [self.connectionQ completedTask:error];
        return ;
    }
    
    self.l2capChannel = channel;
    
    self.l2capThread = [[NSThread alloc] initWithTarget:self selector:@selector(setupL2capStreams) object:nil];
    [self.l2capThread setName:@"l2cap thread name"];
    [self.l2capThread start];

    self.l2capClientHandshakeRunning = TRUE;
    self.useL2cap = [self testL2cap];
    self.l2capClientHandshakeRunning = FALSE;
    
    // wait that server complete L2CAP tests
    [NSThread sleepForTimeInterval:2.0f];
    
    [self.connectionQ completedTask:nil];
}

- (void)setupL2capStreams {
    os_log_debug(OS_LOG_BLE, "🟢 setupL2capStreams called: device=%{public}@: in thread=%{public}@", [self getIdentifier], [[NSThread currentThread] name]);
    
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
        os_log_error(OS_LOG_BLE, "testL2cap: device=%{public}@: timeout hired", [self getIdentifier]);
        [self.l2capHandshakeLatch countDown];
    });
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), self.l2capHandshakeBlock);
    
    // step 1
    os_log_debug(OS_LOG_BLE, "testL2cap: device=%{public}@: client going to write 1st payload", [self getIdentifier]);
    self.l2capHandshakeData = [self createRandomNSData:L2CAP_HANDSHAKE_DATA];
    if (![self l2capWrite:self.l2capHandshakeData]) {
        os_log_error(OS_LOG_BLE, "testL2cap: device=%{public}@: client write error", [self getIdentifier]);
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
        os_log_debug(OS_LOG_BLE, "testL2cap called: device=%{public}@: client going to write 2nd payload", [self getIdentifier]);
        if (![self l2capWrite:[self.remotePeerID dataUsingEncoding:NSUTF8StringEncoding]]) {
            os_log_error(OS_LOG_BLE, "testL2cap called: device=%{public}@: client write error", [self getIdentifier]);
            return FALSE;
        }
        
        os_log_debug(OS_LOG_BLE, "testL2cap called: device=%{public}@: client handshake completed", [self getIdentifier]);
        return TRUE;
    }
    
    return FALSE;
}

- (void)stream:(NSStream *)stream handleEvent:(NSStreamEvent)eventCode {
    switch(eventCode) {
        case NSStreamEventNone: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventNone: identifier=%{public}@", [self getIdentifier]);
            break;
        }
        case NSStreamEventOpenCompleted: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventOpenCompleted: identifier=%{public}@", [self getIdentifier]);
            break;
        }
        case NSStreamEventHasBytesAvailable: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: inputStream NSStreamEventHasBytesAvailable: identifier=%{public}@", [self getIdentifier]);

            uint8_t buf[L2CAP_BUFFER];

            NSInteger len = 0;

            len = [(NSInputStream *)stream read:buf maxLength:L2CAP_BUFFER];

            if(len > 0) {
                NSData *received = [NSData dataWithBytes:buf length:len];
                os_log_debug(OS_LOG_BLE, "stream handleEvent: inputStream NSStreamEventHasBytesAvailable: device=%{public}@ read length=%lu value=%{public}@", [self getIdentifier], len, received);
                [self handleIncomingData:received];
            } else {
                os_log_error(OS_LOG_BLE, "stream handleEvent error: NSStreamEventHasBytesAvailable: identifier=%{public}@: nothing to read", [self getIdentifier]);
            }
            
            break;
        }
        case NSStreamEventHasSpaceAvailable: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventHasSpaceAvailable: identifier=%{public}@", [self getIdentifier]);

            if ((self.peer != nil && [self.peer isConnected]) || self.l2capServerHandshakeRunning || self.l2capClientHandshakeRunning) {
                @synchronized (self.writerLatch) {
                    if (self.l2capWriteData != nil) {
                        uint8_t *readBytes = (uint8_t *)[self.l2capWriteData bytes];
                        readBytes += self.l2capWriteIndex;
                        NSUInteger data_len = [self.l2capWriteData length];
                        NSUInteger len = ((data_len - self.l2capWriteIndex >= L2CAP_BUFFER) ? L2CAP_BUFFER : (data_len - self.l2capWriteIndex));
                        uint8_t buf[len];

                        (void)memcpy(buf, readBytes, len);

                        os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventHasSpaceAvailable: identifier=%{public}@ try to write data offset=%lu len=%lu base64=%{public}@ data=%{public}@", [self getIdentifier], self.l2capWriteIndex, len, [[NSData dataWithBytes:buf length:len] base64EncodedStringWithOptions:0], [BleManager NSDataToHex:[NSData dataWithBytes:buf length:len]]);
                        NSInteger wroteLen = [(NSOutputStream *)stream write:(const uint8_t *)buf maxLength:len];
                        os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventHasSpaceAvailable: identifier=%{public}@ wrote data offset=%lu len=%zd", [self getIdentifier], self.l2capWriteIndex, wroteLen);
                        
                        if (wroteLen == -1) {
                            os_log_error(OS_LOG_BLE, "stream handleEvent error: NSStreamEventHasSpaceAvailable: identifier=%{public}@: write error", [self getIdentifier]);
                            
                            self.l2capWriteData = nil;
                            [self.writeQ completedTask:[NSError errorWithDomain:@LOCAL_DOMAIN code:200 userInfo:@{@"Error reason": @"write error"}]];
                            
                            break;
                        }
                        
                        self.l2capWriteIndex += wroteLen;
                        if ([self.l2capWriteData length] == self.l2capWriteIndex) {
                            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventHasSpaceAvailable: identifier=%{public}@: write completed", [self getIdentifier]);

                            self.l2capWriteData = nil;
                            [self.writeQ completedTask:nil];
                        }
                    } else {
                        os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventHasSpaceAvailable: identifier=%{public}@: no data to write", [self getIdentifier]);
                    }
                }
            } else {
                os_log_error(OS_LOG_BLE, "stream handleEvent error: NSStreamEventHasSpaceAvailable: identifier=%{public}@: device is not connected", [self getIdentifier]);
            }
            
            break;
        }
        case NSStreamEventErrorOccurred: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventErrorOccurred: identifier=%{public}@", [self getIdentifier]);
            
            [self.manager disconnect:self];
            break;
        }
        case NSStreamEventEndEncountered: {
            os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventEndEncountered: identifier=%{public}@", [self getIdentifier]);

            if (self.l2capChannel.outputStream == stream) {
                NSData *newData = [stream propertyForKey:NSStreamDataWrittenToMemoryStreamKey];

                if (!newData) {
                    os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventEndEncountered: identifier=%{public}@: no more data", [self getIdentifier]);
                } else {
                    os_log_debug(OS_LOG_BLE, "stream handleEvent: NSStreamEventEndEncountered: identifier=%{public}@: data to process", [self getIdentifier]);
                    [self handleIncomingData:newData];
                }
            }

            stream.delegate = nil;
            [stream close];
            os_log_error(OS_LOG_BLE, "stream handleEvent: NSStreamEventEndEncountered: identifier=%{public}@: thread name=%{public}@", [self getIdentifier], [[NSThread currentThread] name]);
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
