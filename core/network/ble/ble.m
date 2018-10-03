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

NSString* const READER_COUNTER_UUID = @"A88D3BEC-7A22-477A-97CC-2E0F784CB517";

NSString* const MA_READER_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

NSString* const PEER_ID_READER_UUID = @"0EF50D30-E208-4315-B323-D05E0A23E6B3";

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
		self.peerIDToPeripheral = [[NSMutableDictionary alloc] init];
        self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
        self.maUUID = [CBUUID UUIDWithString:MA_READER_UUID];
		self.peerUUID = [CBUUID UUIDWithString:PEER_ID_READER_UUID];
        self.readerUUID = [CBUUID UUIDWithString:READER_UUID];
        self.readerCounterUUID = [CBUUID UUIDWithString:READER_COUNTER_UUID];
        self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
        self.maCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.maUUID properties:CBCharacteristicPropertyRead value:[ma dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
		self.peerIDCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.peerUUID properties:CBCharacteristicPropertyRead value:[peerID dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.bertyReaderCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.readerUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];
        self.bertyCounterReaderCharacteristic =  [[CBMutableCharacteristic alloc] initWithType:self.readerCounterUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];;
        // self.sender = sender;

        self.bertyService.characteristics = @[self.bertyReaderCharacteristic, self.bertyCounterReaderCharacteristic, self.maCharacteristic, self.peerIDCharacteristic];
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

- (void)write:(NSData *)data {
	NSLog(@"writing.... %@", self.bertyReaderCharacteristic.subscribedCentrals);
	self.toSend = [NSMutableArray arrayWithArray:@[data]];
	[self sendWhatsLeft];
	// [self.peripheralManager updateValue:data forCharacteristic:self.bertyReaderCharacteristic onSubscribedCentrals:self.bertyReaderCharacteristic.subscribedCentrals];
}

- (void)sendToAcceptIncomingChannel:(NSString *)newPeerID {
	NSLog(@"Just ACCEPPPPPPPPTTTTT");
	sendAcceptToListenerForPeerID([self.ma UTF8String], [newPeerID UTF8String]);
}

- (char *)readPeerID:(NSString *)ma {
	NSLog(@"laaa");
	NSLog(@"laaa %@", ma);
	CBCharacteristic *characteristic = [self characteristicWithUUID:self.peerUUID
		forServiceUUID:self.serviceUUID inPeripheral:[self.peerIDToPeripheral objectForKey:ma]];
	// NSLog(@"ICI %@ %@ %@ %@ %@", [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding], [characteristic.value bytes], [characteristic.UUID UUIDString], ma, self.peerIDToPeripheral);
	return [[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] UTF8String];
}

- (NSString *)getPeerIDForPeripheral:(CBPeripheral *)peripheral {
	while (YES) {
		NSString *str = [bcm.peripheralToPeerID objectForKey:peripheral.identifier];
		NSLog(@"lalalal %@ %@", [peripheral.identifier UUIDString], bcm.peripheralToPeerID);
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
    [self.centralManager scanForPeripheralsWithServices: @[self.serviceUUID] options:nil];
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

- (void)centralManager:(CBCentralManager *)central
  didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"didConnectPeriheral: %@", [peripheral.identifier UUIDString]);
    [self.connectedDevice setValue:[[BertyDevice alloc] initWithPeripheral:peripheral] forKey:[peripheral.identifier UUIDString]];
    [peripheral setDelegate:self];
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
    NSLog(@"didDiscoverPeripheral: %@", [peripheral.identifier UUIDString]);
    if (![self.discoveredDevice objectForKey:peripheral.identifier]) {
        [self.discoveredDevice setObject:peripheral forKey:peripheral.identifier];

    [peripheral setDelegate:self];
    [self.centralManager connectPeripheral:peripheral options:nil];
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
        [peripheral discoverCharacteristics:nil forService:service];
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
				NSLog(@"ICICICICICI %@", [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]);
                [self.peripheralToPeerID setObject:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding] forKey:peripheral.identifier];
				NSLog(@"ICICICICICI %@", self.peripheralToPeerID);
                [peripheral readValueForCharacteristic:characteristic];
            } else if ([characteristic.UUID isEqual:self.readerUUID] && characteristic.isNotifying == false) {
                NSLog(@"LA");
                [peripheral setNotifyValue:YES forCharacteristic:characteristic];
            } else if ([characteristic.UUID isEqual:self.peerUUID]) {
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
    if ([characteristic.UUID isEqual:self.maUUID]) {
		// [self.subscribedPeer setValue:[self getPeerIDForPeripheral:peripheral] forKey:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]];
        // [self sendToAcceptIncomingChannel:[[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]];
    }
    if (error) {
        NSLog(@"error: %@", [error localizedDescription]);
    }
	NSLog(@"writing to reader2 %@ %@ %d %@\n\n", [characteristic.UUID UUIDString],characteristic.value, [characteristic.UUID isEqual:self.readerUUID], [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding]);
    if (characteristic.value != nil && [characteristic.UUID isEqual:self.readerUUID]) {
		NSLog(@"writing to reader");

		sendBytesToStream([[[NSString alloc] initWithData:[self characteristicWithUUID:self.maUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral].value encoding:NSUTF8StringEncoding] UTF8String], [characteristic.value bytes], [characteristic.value length]);
        // BertyDevice *device = [self.connectedDevice objectForKey:[peripheral.identifier UUIDString]];
        // if ([characteristic.value bytes] == nil || ((char*)[characteristic.value bytes])[0] == 0) {
        //   NSLog(@"didUpdateValueForCharacteristic %@ %@", [characteristic.UUID UUIDString], [[NSString alloc] initWithData:[self characteristicWithUUID:self.maUUID forServiceUUID:self.serviceUUID inPeripheral:peripheral].value encoding:NSUTF8StringEncoding]);
        //   [device.data setLength:0];
        // } else if (device != nil) {
        //   [device.data appendData:characteristic.value];
        // }
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
	NSArray<CBPeripheral *>* peripherals = [self.centralManager retrievePeripheralsWithIdentifiers:@[central.identifier]];
	for (CBPeripheral *dperipheral in peripherals) {
		if ([dperipheral.identifier isEqual:central.identifier]) {
			NSLog(@"REICEVE READ REQ");
			dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
				NSString *str = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
				// if (![str isEqual:@""]) {
					NSString *peerID = [self getPeerIDForPeripheral:dperipheral];
					[self.connectedPeer setValue:@"connected" forKey:peerID];
					[self.peerIDToPeripheral setValue:dperipheral forKey:peerID];
					[self sendToAcceptIncomingChannel:peerID];
				// }
   				NSLog(@"Deferring 1");
			});
			//
			[dperipheral setDelegate:self];
			if (![self.discoveredDevice objectForKey:dperipheral.identifier]) {
				[self.discoveredDevice setObject:dperipheral forKey:dperipheral.identifier];
			}
			[self.centralManager connectPeripheral:dperipheral options:nil];
			[dperipheral discoverServices:@[self.serviceUUID]];
		}
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
                NSLog(@"REICEVE READ REQ");
				[peripheral discoverServices:@[self.serviceUUID]];
            }
        }
    }
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
  didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
		// [self checkPeripheralAndConnect:peripheral];
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


@end
