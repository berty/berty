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
static const int L2CAP_BUFFER = 1024;

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
    self = [self initWithIdentifier:[peripheral.identifier UUIDString] asClient:TRUE];
    
    if (self) {
        [self setPeripheral:peripheral central:manager];
        _name = name;
    }
    
    return self;
}

- (instancetype)initWithIdentifier:(NSString *)identifier asClient:(BOOL)client{
    self = [super init];
    
    if (self) {
        if (client) {
            _clientSideIdentifier = [identifier retain];
        } else {
            _serverSideIdentifier = [identifier retain];
        }
        
        _peripheral = nil;
        _manager = nil;
        _remotePeerID = nil;
        _psm = 0;
        
        _queue = [[BleQueue alloc] init: dispatch_get_main_queue()];
        _writeQ = [[BleQueue alloc] init: dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)];
        
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
    }
    
    return self;
}

- (void)dealloc {
    [_clientSideIdentifier release];
    [_serverSideIdentifier release];
    [_peripheral release];
    _manager = nil;
    [_remotePeerID release];
    [_queue release];
    [_writeQ release];
    [_characteristicHandlers release];
    [_characteristicData release];
    [_dataCache release];
    
    [super dealloc];
}

- (void)setPeripheral:(CBPeripheral *)peripheral central:(BleManager *)manager {
    self.peripheral = peripheral;
    self.manager = manager;
}

- (NSString *__nonnull)getIdentifier {
    if (self.clientSideIdentifier != nil) {
        return self.clientSideIdentifier;
    }
    
    return self.serverSideIdentifier;
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

- (BOOL)handleIncomingData:(NSData *__nonnull)data {
    if (!self.peer) {
        os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: peer not existing", [self getIdentifier]);
        return FALSE;
    }
    
    if (![self.peer isConnected]) {
        os_log(OS_LOG_BLE, "handleIncomingData: device=%{public}@: peer not connected, put data in cache", [self getIdentifier]);
        @try {
            [self.dataCache offer:data];
        }
        @catch (NSException *e) {
            os_log_error(OS_LOG_BLE, "handleIncomingData: device=%{public}@: cannot add data in cache", [self getIdentifier]);
            return FALSE;
        }
        return TRUE;
    }
    
    os_log_debug(OS_LOG_BLE, "handleIncomingData: device=%{public}@ base64=%{public}@ data=%{public}@", [self getIdentifier], [data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:data]);
    
    BLEBridgeReceiveFromPeer(self.remotePeerID, data);
    return TRUE;
}

// Need to copy blocks into the heap because writing is async and the handshake function's stack should not be available
- (void)handshake {
    [self writeToCharacteristic:[self.manager.localPID dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:self.peerIDCharacteristic withEOD:TRUE tryL2cap:FALSE];
    
    os_log_debug(OS_LOG_BLE, "handshake: going to read remote peerID");
    [self.writeQ add:^{
        os_log_debug(OS_LOG_BLE, "handshake: read remote peerID");
        [self.peripheral readValueForCharacteristic:self.peerIDCharacteristic];
    } withCallback:nil withDelay:0];
    
    os_log_debug(OS_LOG_BLE, "handshake: going to subscribe to writer notifications");
    [self.writeQ add:^{
        os_log_debug(OS_LOG_BLE, "handshake: subscribe to writer notifications");
        [self.peripheral setNotifyValue:TRUE forCharacteristic:self.writerCharacteristic];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices {
    CBService *service = getService(invalidatedServices, [BleManager.serviceUUID UUIDString]);
    if (service == nil) {
        return;
    }
    os_log_debug(OS_LOG_BLE, "🟢 didModifyServices() with invalidated %{public}@", invalidatedServices);
    
    [self.manager cancelPeripheralConnection:peripheral];
}

- (void)handleConnect:(NSError *)error {
    [self.queue completedTask:error];
    
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 handleConnect() device %{public}@ connection failed %{public}@", [self getIdentifier], error);
        [self.manager cancelPeripheralConnection:self.peripheral];
        return;
    }
    
    os_log_debug(OS_LOG_BLE, "🟢 handleConnect() device %{public}@ connection succeed", [self getIdentifier]);
    [self discoverServices:@[self.manager.serviceUUID]];
}

- (void)connectWithOptions:(NSDictionary *)options {
    os_log_debug(OS_LOG_BLE, "connectWithOptions called: identifier=%{public}@", [self getIdentifier]);
    [self.queue add:^{
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

//TODO: return write status to caller
- (BOOL)writeToCharacteristic:(NSData *)data forCharacteristic:(CBCharacteristic *)characteristic withEOD:(BOOL)eod tryL2cap:(BOOL)tryL2cap {
    __block BOOL success = FALSE;
    if (self.peripheral != nil) {
        os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ base64=%{public}@ data=%{public}@", [self getIdentifier], [data base64EncodedStringWithOptions:0], [BleManager NSDataToHex:data]);
        
        // try L2cap
        if (tryL2cap) {
            ConnectedPeer *peer = [PeerManager getPeer:self.remotePeerID];
            if (peer != nil) {
                if (peer.channel != nil) {
                    os_log_debug(OS_LOG_BLE, "writeToCharacteristic() identifier=%{public}@ using L2cap", [self getIdentifier]);
                    uint8_t *payload = (uint8_t *)[data bytes];
                    NSUInteger writeBytes = 0;
                    uint8_t buf[L2CAP_BUFFER];
                    NSUInteger dataLen = [data length];
                    NSOutputStream *output = peer.channel.outputStream;
                    while (writeBytes < dataLen) {
                        NSUInteger len = ((dataLen - writeBytes >= L2CAP_BUFFER) ? L2CAP_BUFFER : ([data length] - writeBytes));
                        memcpy(buf, payload, len);
                        os_log_debug(OS_LOG_BLE, "writeToCharacteristic() identifier=%{public}@ L2cap: data offset=%lu len=%lu payload=%p buffer=%{public}@", [self getIdentifier], writeBytes, len, payload, [NSData dataWithBytes:buf length:len]);
                        [output write:(const uint8_t *)buf maxLength:len];
                        payload += (unsigned long int)len;
                        writeBytes += len;
                    }
                    return TRUE;
                }
            }
        }
        
        NSData *toSend = nil;
        self.remainingData = data;
        CountDownLatch *countDownLatch = [[CountDownLatch alloc] initCount:0];
        
        while (self.remainingData.length > 0) {
            toSend = [[self getDataToSend] retain];
            [countDownLatch incrementCount];
            
            os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ going to write payload=%{public}@", [self getIdentifier], toSend);
            [self.writeQ add:^{
                os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ writing base64=%{public}@ data=%{public}@", [self getIdentifier], [toSend base64EncodedStringWithOptions:0], [BleManager NSDataToHex:toSend]);
                [self.peripheral writeValue:toSend forCharacteristic:characteristic type:CBCharacteristicWriteWithResponse];
            } withCallback:^(NSError *error){
                os_log_debug(OS_LOG_BLE, "writeToCharacteristic: identifier=%{public}@ callback for payload=%{public}@ status=%{public}@", [self getIdentifier], toSend, error);
                success = error == nil ? TRUE : FALSE;
                [countDownLatch countDown];
            } withDelay:0];
            
            [toSend release];
        }
        
        [countDownLatch await];
        
        // don't write EOD is error occured
        if (!success) {
            os_log_error(OS_LOG_BLE, "writeToCharacteristic error: identifier=%{public}@: cancel", [self getIdentifier]);
            return FALSE;
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
    } else {
        os_log_debug(OS_LOG_BLE, "🟢 writeToCharacteristic() NULLABLE identifier=%{public}@ data: %{public}@", [self getIdentifier], data);
        [self.manager cancelPeripheralConnection:self.peripheral];
    }
    
    return success;
}

- (void)l2capRead:(ConnectedPeer *__nonnull)peer {
    os_log_debug(OS_LOG_BLE, "l2capRead: device=%{public}@ started", [self getIdentifier]);
    
    NSInputStream *input = peer.channel.inputStream;
    NSInteger result;
    uint8_t buffer[L2CAP_BUFFER];
    while((result = [input read:buffer maxLength:L2CAP_BUFFER]) > 0) {
        NSData *received = [NSData dataWithBytes:buffer length:result];
        os_log_debug(OS_LOG_BLE, "l2capRead: device=%{public}@ read value=%{public}@", [self getIdentifier], received);
        BLEBridgeReceiveFromPeer(self.remotePeerID, received);
    }
    
    if (result == -1) {
        os_log_error(OS_LOG_BLE, "🔴 l2capRead error: device=%{public}@ read error", [self getIdentifier]);
    }
    
    os_log_debug(OS_LOG_BLE, "l2capRead: device=%{public}@ leaving", [self getIdentifier]);
}

- (void)peripheral:(CBPeripheral *)peripheral didOpenL2CAPChannel:(CBL2CAPChannel *)channel error:(NSError *)error {
    os_log_debug(OS_LOG_BLE, "🟢 didOpenL2CAPChannel called: device=%{public}@", [self getIdentifier]);
    [self.l2capLatch countDown];
    if (error != nil) {
        os_log_error(OS_LOG_BLE, "🔴 didOpenL2CAPChannel error=%{public}@ device=%{public}@", error, [self getIdentifier]);
        return ;
    }
    
    ConnectedPeer *peer = [PeerManager getPeer:self.remotePeerID];
    if (peer == nil) {
        os_log_error(OS_LOG_BLE, "🔴 didOpenL2CAPChannel error: device=%{public}@ peer not found", [self getIdentifier]);
        return ;
    }
    
    [peer setChannel:channel];
    [channel.inputStream open];
    [channel.outputStream open];
    
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        [self l2capRead:peer];
    });
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
    [self.writeQ completedTask:error];
    
    if (error) {
        os_log_error(OS_LOG_BLE, "didUpdateNotificationStateForCharacteristic error: device=%{public}@ characteristic=%{public}@ status=%{public}@", [self getIdentifier], [characteristic.UUID UUIDString], error);
        [self.manager cancelPeripheralConnection:self.peripheral];
        return;
    }
    
    self.peer = [PeerManager registerDevice:self withPeerID:self.remotePeerID isClient:TRUE];
    if (self.peer == nil) {
        os_log_error(OS_LOG_BLE, "didReceiveReadRequests: identifier=%{public}@ registerDevice failed", [self getIdentifier]);
        [self.manager cancelPeripheralConnection:self.peripheral];
    } else {
        os_log_debug(OS_LOG_BLE, "didReceiveReadRequests: identifier=%{public}@ registerDevice successed", [self getIdentifier]);
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error {
    if (error) {
        os_log_error(OS_LOG_BLE, "didUpdateValueForCharacteristic() device %{public}@ read failed characteristic=%{public}@ status=%{public}@", [self getIdentifier], [characteristic.UUID UUIDString], error);
        [self.manager cancelPeripheralConnection:self.peripheral];
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
            
            ////        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(6 * NSEC_PER_SEC)), dispatch_get_global_queue(0, 0), ^{
            //        dispatch_async(dispatch_get_global_queue(0, 0), ^{
            //            ConnectedPeer *peer = [PeerManager getPeer:remotePeerID];
            //            if (peer) {
            //                os_log_debug(OS_LOG_BLE, "🟢 didUpdateValueForCharacteristic: peerID known in connectedPeers");
            //                if ([peer channel] == nil && self.manager.psm != 0) {
            //                    @synchronized ([peer channel]) {
            //                        os_log_debug(OS_LOG_BLE, "🟢 didUpdateValueForCharacteristic: identifier=%{public}@ opening l2cap channel", [[peripheral identifier] UUIDString]);
            //                        self.l2capLatch = [[CountDownLatch alloc] init:1];
            //                        [peripheral openL2CAPChannel:self.psm];
            //                        os_log_debug(OS_LOG_BLE, "🟢 didUpdateValueForCharacteristic: identifier=%{public}@ before wait", [[peripheral identifier] UUIDString]);
            //                        [self.l2capLatch await];
            //                        os_log_debug(OS_LOG_BLE, "🟢 didUpdateValueForCharacteristic: identifier=%{public}@ after wait", [[peripheral identifier] UUIDString]);
            //                        [self.l2capLatch release];
            //                        self.l2capLatch = nil;
            //
            //                        [peer setClient:self];
            //                        [peer setClientReady:TRUE];
            //                        if (![self checkAndHandleFoundPeer]) {
            //                            [self.manager cancelPeripheralConnection:self.peripheral];
            //                        }
            //                    }
            //                } else {
            //                    [peer setClient:self];
            //                    [peer setClientReady:TRUE];
            //                    if (![self checkAndHandleFoundPeer]) {
            //                        [self.manager cancelPeripheralConnection:self.peripheral];
            //                    }
            //                }
            //            } else {
            //                os_log_debug(OS_LOG_BLE, "🟡 didUpdateValueForCharacteristic: peerID unknown in connectedPeers");
            //                ConnectedPeer *peer = [[ConnectedPeer alloc] init];
            //                [peer setClient:self];
            //                [peer setClientReady:TRUE];
            //                [PeerManager addPeer:peer forPeerID:remotePeerID];
            //            }
            //        });
            
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
        [self.manager cancelPeripheralConnection:self.peripheral];
    }
    
    [self.writeQ completedTask:nil];
}

#pragma mark - Characteristic Discovery

- (void)discoverCharacteristics:(nullable NSArray *)characteristics forService:(CBService *)service {
    [self.queue add:^{
        [self.peripheral discoverCharacteristics:characteristics forService:service];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
    [self.queue completedTask:error];
    
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverCharacteristicsForService() device %{public}@ discover characteristic failed: %{public}@", [self getIdentifier], error);
        [self.manager cancelPeripheralConnection:self.peripheral];
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
        [self.manager cancelPeripheralConnection:self.peripheral];
        return ;
    }
    
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        [self handshake];
    });
}

#pragma mark - Services Discovery

- (void)discoverServices:(NSArray *)serviceUUIDs {
    self.peripheral.delegate = self;
    [self.queue add:^{
        [self.peripheral discoverServices:serviceUUIDs];
    } withCallback:nil withDelay:0];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error {
    [self.queue completedTask:error];
    
    if (error) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverServices() device %{public}@ discover service failed: %{public}@", [self getIdentifier], error);
        [self.manager cancelPeripheralConnection:self.peripheral];
        return;
    }
    os_log_debug(OS_LOG_BLE, "🟢 didDiscoverServices() device %{public}@ service discover succeed", [self getIdentifier]);
    CBService *service = getService(self.peripheral.services, [self.manager.serviceUUID UUIDString]);
    
    if (service == nil) {
        os_log_debug(OS_LOG_BLE, "🔴 didDiscoverServices() service not found");
        [self.manager cancelPeripheralConnection:self.peripheral];
        return;
    }
    [self discoverCharacteristics:@[self.manager.peerUUID, self.manager.writerUUID,] forService:service];
}

@end
