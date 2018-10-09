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
	NSLog(@"peeeeeeeeeerrrrrrrrrrrrr ID asdkljsadl %s", peerID);
	NSLog(@"peeeeeeeeeerrrrrrrrrrrrr ID %@", [NSString stringWithUTF8String:peerID]);
	bcm = [[BertyCentralManager alloc] initWithMa:[NSString stringWithUTF8String:ma] AndPeerID:[NSString stringWithUTF8String:peerID]];
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

// int isDiscovered(char *ma) {
//     // [];
// }

int startAdvertising() {
	if (![bcm.peripheralManager isAdvertising]) {
		NSLog(@"Start advertising called");
    	[bcm startAdvertising];
		return 1;
	}
	return 0;
}

NSData *Bytes2NSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }

void writeNSData(NSData *data) {
	[bcm write:data];
}

int checkDeviceConnected(char *peerID) {
	NSLog(@"bcm.connected %@ %@",[NSString stringWithUTF8String:peerID], bcm.connectedPeer );
	if ([bcm.connectedPeer objectForKey:[NSString stringWithUTF8String:peerID]]) {
			return 1;
	}
	return 0;
}

char *readPeerID(char *peerID) {
	return [bcm readPeerID:[NSString stringWithUTF8String:peerID]];
}

int dialPeer(char *peerID) {
	return [bcm dialPeer:[NSString stringWithUTF8String:peerID]];
}

@interface MyDefer : NSObject
+ (instancetype)block:(void(^)())block;
@end
@implementation MyDefer {
   @private void(^_deferBlock)();
}
+ (instancetype)block:(void (^)())block {
   MyDefer *_d = [MyDefer new];
   _d->_deferBlock = block ?: ^{};
   return _d;
}
- (void)dealloc {
	dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
   		_deferBlock();
    });
}
@end

@implementation BertyCentralManager

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6663";

NSString* const READER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const MA_READER_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

NSString* const PEER_ID_READER_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

NSString* const DIAL_UUID = @"2DE2A6D6-8204-4619-AA88-2060625D6B42";

NSString* const ACCEPT_UUID = @"6F110ECA-9FCC-4BB3-AB45-6F13565E2E34";

- (instancetype)initWithMa:(NSString *)ma AndPeerID:(NSString *)peerID{
    self = [super init];
    if (self) {
        self.serviceAdded = NO;
        self.ma = ma;
        self.peerID = peerID;
        self.connectedDevice = [[NSMutableDictionary alloc] init];
        self.connectedPeer = [[NSMutableDictionary alloc] init];
        self.peripheralToPeerID = [[NSMutableDictionary alloc] init];
        self.discoveredDevice = [[NSMutableDictionary alloc] init];
        self.bertyDevices = [[NSMutableDictionary alloc] init];
		self.acceptSemaphore = [[NSMutableDictionary alloc] init];
        self.peerIDToPeripheral = [[NSMutableDictionary alloc] init];
        self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
        self.maUUID = [CBUUID UUIDWithString:MA_READER_UUID];
        self.peerUUID = [CBUUID UUIDWithString:PEER_ID_READER_UUID];
        self.dialUUID = [CBUUID UUIDWithString:DIAL_UUID];
        self.readerUUID = [CBUUID UUIDWithString:READER_UUID];
        self.acceptUUID = [CBUUID UUIDWithString:ACCEPT_UUID];
        self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
        self.acceptCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.acceptUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsReadable | CBAttributePermissionsWriteable];
        self.maCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.maUUID properties:CBCharacteristicPropertyRead value:[ma dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        // self.dialCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.dialUUID properties:CBCharacteristicPropertyWrite value:nil permissions:CBAttributePermissionsWriteable];
        self.peerIDCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.peerUUID properties:CBCharacteristicPropertyRead value:[peerID dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.bertyReaderCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.readerUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];
        // self.sender = sender;

        self.bertyService.characteristics = @[self.bertyReaderCharacteristic, self.acceptCharacteristic, self.maCharacteristic, self.peerIDCharacteristic];
        self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0) options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0) options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.centralManager.delegate = self;
        self.peripheralManager.delegate = self;
    }

	NSLog(@"init finished");
	[self startAdvertising];
	[self startDiscover];
    return self;
}

- (int)dialPeer:(NSString *)peerID {
    BertyDevice *device = nil;
	NSLog(@"device123 %@", device);
	while (device == nil) {
		device = [self getDeviceFromPeerID:peerID];
        if (device != nil) {
            dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
            [self.acceptSemaphore setObject:semaphore forKey:device.peripheral.identifier];
            [device.peripheral writeValue:[[NSData alloc] init] forCharacteristic:[self characteristicWithUUID:self.acceptUUID forServiceUUID:self.serviceUUID inPeripheral:device.peripheral] type:CBCharacteristicWriteWithResponse];
            dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
            dispatch_release(semaphore);
            return 1;
        }
	}
	return 0;
}

- (void)write:(NSData *)data {
	self.toSend = [NSMutableArray arrayWithArray:@[data]];
	[self sendWhatsLeft];
}

- (void)sendToAcceptIncomingChannel:(BertyDevice*)device {
	sendAcceptToListenerForPeerID([self.ma UTF8String], [device.ma UTF8String], [device.peerID UTF8String]);
}

- (char *)readPeerID:(NSString *)ma {
	CBCharacteristic *characteristic = [self characteristicWithUUID:self.peerUUID
		forServiceUUID:self.serviceUUID inPeripheral:[self.peerIDToPeripheral objectForKey:ma]];
	// NSLog(@"ICI %@ %@ %@ %@ %@", [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding], [characteristic.value bytes], [characteristic.UUID UUIDString], ma, self.peerIDToPeripheral);
	return [[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] UTF8String];
}

- (NSString *)getPeerIDForPeripheral:(CBPeripheral *)peripheral {
	while (YES) {
		NSString *str = [bcm.peripheralToPeerID objectForKey:peripheral.identifier];
		if (str != nil && ![str isEqual:@""]) {
			return str;
		}
		[NSThread sleepForTimeInterval:.5];
	}
	return nil;
}

- (void)startAdvertising {
    [self.peripheralManager startAdvertising:@{
                                              CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]
                                               }];
}

- (void)startDiscover {
    NSLog(@"Start dicovering");
    [self.centralManager scanForPeripheralsWithServices: @[self.serviceUUID] options:@{CBCentralManagerScanOptionAllowDuplicatesKey:@NO}];
}

-(void)sendWhatsLeft {
    NSMutableArray *toRemove = [[NSMutableArray alloc] initWithCapacity:[self.toSend count]];

    for (NSData *str in self.toSend) {
        if ([self.peripheralManager updateValue:str forCharacteristic:self.bertyReaderCharacteristic onSubscribedCentrals:nil] == YES) {
            [toRemove addObject:str];
        } else {
            break;
        }
    }

    for (NSData *str in toRemove) {
        [self.toSend removeObject:str];
    }
}

- (void) updateValue {
    self.toSend = [NSMutableArray arrayWithArray:@[[@"part1" dataUsingEncoding:NSUTF8StringEncoding], [@"part2" dataUsingEncoding:NSUTF8StringEncoding], [@"" dataUsingEncoding:NSUTF8StringEncoding]]];

    [self sendWhatsLeft];
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

// - (int)isDiscovered:(NSString*)ma {
//     [self.discoveredDevice objectForKey:ma]
// }

- (void)centralManager:(CBCentralManager *)central
  didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"didConnectPeriheral: %@", [peripheral.identifier UUIDString]);
    [peripheral discoverServices:@[self.serviceUUID]];
}

- (void)centralManager:(CBCentralManager *)central
didDisconnectPeripheral:(CBPeripheral *)peripheral
                 error:(NSError *)error {
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
    if (![self.discoveredDevice objectForKey:peripheral.identifier]) {
        NSLog(@"didDiscoverPeripheral: %@", [peripheral.identifier UUIDString]);
        [peripheral setDelegate:self];
        [self.bertyDevices setObject:[[BertyDevice alloc]initWithPeripheral:peripheral] forKey:[peripheral.identifier UUIDString]];
        [self.centralManager connectPeripheral:peripheral options:nil];
        [self.discoveredDevice setObject:peripheral forKey:peripheral.identifier];
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
    for (CBService* service in peripheral.services) {
        if ([service.UUID isEqual:self.serviceUUID]) {
            NSLog(@"try discovering charact");
            [peripheral discoverCharacteristics:@[self.peerUUID, self.readerUUID, self.maUUID, self.acceptUUID] forService:service];
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
    NSLog(@"didDiscoverCharacteristicsForService %@ %@", [peripheral.identifier UUIDString], [service.UUID UUIDString]);
    if (error == nil) {
        for (CBCharacteristic *characteristic in service.characteristics) {
                NSLog(@"didDiscoverCharacteristicsForService %@ %@ %@", [peripheral.identifier UUIDString], [service.UUID UUIDString], [characteristic.UUID UUIDString]);
            if ([characteristic.UUID isEqual:self.maUUID]) {
                // [self.peripheralToPeerID setObject:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] forKey:peripheral.identifier];
                NSLog(@"Try reading ma");
                [peripheral readValueForCharacteristic:characteristic];
            } else if ([characteristic.UUID isEqual:self.readerUUID]) {
                NSLog(@"Try subscribe to reader");
                [peripheral setNotifyValue:YES forCharacteristic:characteristic];
            } else if ([characteristic.UUID isEqual:self.peerUUID]) {
                NSLog(@"Try reading peer");
                [peripheral readValueForCharacteristic:characteristic];
            }
        }
    } else {
        NSLog(@"error discovering %@ %@", [error localizedFailureReason], [error localizedDescription]);
    }

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
    BertyDevice *device = [self getDeviceFromPeripheral:peripheral];
    if ([characteristic.UUID isEqual:self.maUUID] && device != nil) {
        [device setMa:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]];
    } else if ([characteristic.UUID isEqual:self.peerUUID] && device != nil) {
        [device setPeerID:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]];
    } else if  ([characteristic.UUID isEqual:self.readerUUID]) {
        sendBytesToStream([[self getDeviceFromPeripheral:peripheral].ma UTF8String], [characteristic.value bytes], [characteristic.value length]);
    }
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
    if (error) {
        NSLog(@"error: %@", [error localizedFailureReason]);
    }
    NSLog(@"didWriteValueForCharacteristic %@", characteristic.UUID);
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
    NSLog(@"didModifyServices");
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
				NSLog(@"ICI %@", self.bertyService);
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
	// [self checkPeripheralAndConnect:peripheral];
	if ([characteristic.UUID isEqual:self.readerUUID]) {
		BertyDevice *device = [self getDeviceFromUUID:[central.identifier UUIDString]];
		[device setIsSubscribe:YES];
	}
    NSLog(@"Subscription to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
                  central:(CBCentral *)central
didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"Unsubscribed to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
    NSLog(@"peripheralManagerIsReadyToUpdateSubscribers");
    [self sendWhatsLeft];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveReadRequest:(CBATTRequest *)request {
	NSLog(@"REICEVE READ REQ");
    if ([request.characteristic.UUID isEqual:self.maUUID]) {
        NSArray<CBPeripheral *>* peripherals = [self.centralManager retrievePeripheralsWithIdentifiers:@[request.central.identifier]];
        for (CBPeripheral *peripheral in peripherals) {
			if ([peripheral.identifier isEqual:request.central.identifier]) {

				// [peripheral discoverServices:@[self.serviceUUID]];
            }
        }
    }
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
  didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
	for (CBATTRequest *request in requests) {
        if ([request.characteristic.UUID isEqual:self.acceptUUID]) {
            [peripheral respondToRequest:request withResult:CBATTErrorSuccess];
			BertyDevice *device = nil;
			while (device == nil && device.isReady == NO) {
				device = [self getDeviceFromUUID:[request.central.identifier UUIDString]];
			}
			[self sendToAcceptIncomingChannel:device];
        }
    }
    NSLog(@"request write %@", requests);
}

- (void)discoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"disco for charact %@", characteristic.UUID);
}

- (void)checkPeripheralAndAdd:(CBATTRequest *)req {
	if (self.connectedDevice[[req.central.identifier UUIDString]] == nil) {
		NSArray<CBPeripheral *>* peripherals = [self.centralManager retrievePeripheralsWithIdentifiers:@[req.central.identifier]];
		for (CBPeripheral *peripheral in peripherals) {
			for (CBService *service in peripheral.services) {
				if ([service.UUID isEqual:self.serviceUUID]) {
					[self.connectedDevice setValue:
						[[BertyDevice alloc] initWithPeripheral:peripheral]
						forKey:[peripheral.identifier UUIDString]
					];
				}
			}
		}
	}
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
