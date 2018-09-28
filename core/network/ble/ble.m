//
//  main.m
//  kjh
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import "ble.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <Foundation/Foundation.h>

static BertyCentralManager *bcm;

void init(char *peerID) {
	NSLog(@"peeeeeeeeeerrrrrrrrrrrrr ID asdkljsadl %s", peerID);
	NSLog(@"peeeeeeeeeerrrrrrrrrrrrr ID %@", [NSString stringWithUTF8String:peerID]);
	bcm = [[BertyCentralManager alloc] initWithPeerID:[NSString stringWithUTF8String:peerID]];
}

void startDiscover() {
    [bcm startDiscover];
}

void startAdvertising() {
    [bcm startAdvertising];
}

@implementation BertyCentralManager

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6663";

NSString* const READER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const READER_COUNTER_UUID = @"A88D3BEC-7A22-477A-97CC-2E0F784CB517";

NSString* const PEER_ID_READER_UUID = @"9B827770-DC72-4C55-B8AE-0870C7AC15A8";

- (instancetype)initWithPeerID:(NSString *)peerID {
    self = [super init];
    if (self) {
        self.serviceAdded = NO;
				self.peerID = peerID;
        self.connectedDevice = [[NSMutableDictionary alloc] init];
        self.discoveredDevice = [[NSMutableDictionary alloc] init];
        self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
        self.peerIDUUID = [CBUUID UUIDWithString:PEER_ID_READER_UUID];
        self.readerUUID = [CBUUID UUIDWithString:READER_UUID];
        self.readerCounterUUID = [CBUUID UUIDWithString:READER_COUNTER_UUID];
        self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
        self.peerIDCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.peerIDUUID properties:CBCharacteristicPropertyRead value:[peerID dataUsingEncoding:NSUTF8StringEncoding] permissions:CBAttributePermissionsReadable];
        self.bertyReaderCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.readerUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];
        self.bertyCounterReaderCharacteristic =  [[CBMutableCharacteristic alloc] initWithType:self.readerCounterUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];;
        // self.sender = sender;

        self.bertyService.characteristics = @[self.bertyReaderCharacteristic, self.bertyCounterReaderCharacteristic, self.peerIDCharacteristic];
        self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0) options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0) options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
        self.centralManager.delegate = self;
        self.peripheralManager.delegate = self;

    }

    return self;
}

- (void)sendToAcceptIncomingChannel:(NSString *)newPeerID {
	sendAcceptToListenerForPeerID([self.peerID UTF8String], [newPeerID UTF8String]);
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
    }
    [peripheral setDelegate:self];
    [self.centralManager connectPeripheral:peripheral options:nil];
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
        NSLog(@"ICI123");
        for (CBCharacteristic *characteristic in service.characteristics) {
            NSLog(@"ICI123 %@", [characteristic.UUID UUIDString]);
            if ([characteristic.UUID isEqual:self.readerCounterUUID] && characteristic.isNotifying == false) {
                //        [peripheral setNotifyValue:YES forCharacteristic:characteristic];
                NSLog(@"ICI");
                [peripheral discoverCharacteristics:@[self.readerUUID] forService:service];

            } else if ([characteristic.UUID isEqual:self.readerUUID] && characteristic.isNotifying == false) {
                NSLog(@"LA");
                [peripheral setNotifyValue:YES forCharacteristic:characteristic];
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
    if (error) {
        NSLog(@"error: %@", [error localizedDescription]);
    }
    if (characteristic.value != nil) {
        // BertyDevice *device = [self.connectedDevice objectForKey:[peripheral.identifier UUIDString]];
        // if ([characteristic.value bytes] == nil || ((char*)[characteristic.value bytes])[0] == 0) {
        //   NSLog(@"didUpdateValueForCharacteristic %@ %@", [characteristic.UUID UUIDString], [[NSString alloc] initWithData:device.data encoding:NSUTF8StringEncoding]);
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
    [self.peripheralManager startAdvertising:@{
                                               CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]
                                               }];
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
		[self checkPeripheralAndAdd:request];
    NSLog(@"request read %@", request);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
  didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
		// [self checkPeripheralAndConnect:peripheral];
    NSLog(@"request write %@", requests);
}

- (void)discoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic {
    NSLog(@"disco for charact %@", characteristic.UUID);
}

- (void) release {
	// NSLog(@"\n\n\n\n\n\n\nrelease\n\n\n\n");
	// [super release];
}

- (void) dealloc {
	NSLog(@"\n\n\n\n\n\n\nDealllloooooocatteee\n\n\n\n");
	[super dealloc];
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
			[self sendToAcceptIncomingChannel:[req.central.identifier UUIDString]];
		}
	}
}


@end
