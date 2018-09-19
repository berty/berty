//
//  BertyCentralManager.m
//  bluetooth
//
//  Created by sacha on 05/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <React/RCTLog.h>
#import "BertyCentralManager.h"

@implementation BertyCentralManager

NSString* const SERVICE_UUID = @"A06C6AB8-886F-4D56-82FC-2CF8610D6663";

NSString* const READER_UUID = @"000CBD77-8D30-4EFF-9ADD-AC5F10C2CC1C";

NSString* const READER_COUNTER_UUID = @"A88D3BEC-7A22-477A-97CC-2E0F784CB517";

- (instancetype)initWithSender:(id)sender {
  self = [super init];
    if (self) {
      self.connectedDevice = [[NSMutableDictionary alloc] init];
      self.discoveredDevice = [[NSMutableDictionary alloc] init];
      self.centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:nil options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
      self.peripheralManager = [[CBPeripheralManager alloc] initWithDelegate:self queue:nil options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];
      self.serviceUUID = [CBUUID UUIDWithString:SERVICE_UUID];
      self.readerUUID = [CBUUID UUIDWithString:READER_UUID];
      self.readerCounterUUID = [CBUUID UUIDWithString:READER_COUNTER_UUID];
      self.bertyService = [[CBMutableService alloc] initWithType:self.serviceUUID primary:YES];
      self.bertyReaderCharacteristic = [[CBMutableCharacteristic alloc] initWithType:self.readerUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];
      self.bertyCounterReaderCharacteristic =  [[CBMutableCharacteristic alloc] initWithType:self.readerCounterUUID properties:CBCharacteristicPropertyRead | CBCharacteristicPropertyNotify value:nil permissions:CBAttributePermissionsReadable];;
      self.sender = sender;
      
      self.bertyService.characteristics = @[self.bertyReaderCharacteristic, self.bertyCounterReaderCharacteristic];

      [self centralManagerDidUpdateState:self.centralManager];
    }
    return self;
  }

- (void)discover {
  RCTLogInfo(@"Start dicovering");
  [self.centralManager scanForPeripheralsWithServices: @[self.serviceUUID] options:nil];
}

- (void) connect {
  
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
  RCTLogInfo(@"didConnectPeriheral: %@", [peripheral.identifier UUIDString]);
  [self.connectedDevice setValue:[[BertyDevice alloc] initWithPeripheral:peripheral] forKey:[peripheral.identifier UUIDString]];
  [peripheral setDelegate:self];
  [peripheral discoverServices:@[self.serviceUUID]];
}

- (void)centralManager:(CBCentralManager *)central
didDisconnectPeripheral:(CBPeripheral *)peripheral
                 error:(NSError *)error {
  RCTLogInfo(@"didDisConnectPeriheral: %@", [peripheral.identifier UUIDString]);
}

- (void)centralManager:(CBCentralManager *)central
didFailToConnectPeripheral:(CBPeripheral *)peripheral
                 error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error %@", [error localizedFailureReason]);
  }
  RCTLogWarn(@"error connecting to: %@", [peripheral.identifier UUIDString]);
}

- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *,id> *)advertisementData
                  RSSI:(NSNumber *)RSSI {
  RCTLogInfo(@"didDiscoverPeripheral: %@", [peripheral.identifier UUIDString]);
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
    case CBCentralManagerStateResetting:
      break;
    case CBCentralManagerStateUnsupported:
      break;
    case CBCentralManagerStateUnauthorized:
      break;
    case CBCentralManagerStatePoweredOff:
      stateString = @"Bluetooth is currently powered off.";
      break;
    case CBCentralManagerStatePoweredOn:
      stateString = @"Bluetooth is currently powered on and available to use.";
      if (self.peripheralManager.state == CBPeripheralManagerStatePoweredOn) {
        [self.peripheralManager addService:self.bertyService];
      }
      break;
    default:
      stateString = @"State unknown, update imminent.";
      break;
  }

  RCTLogInfo(@"Bluetooth State %@",stateString);
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverServices:(NSError *)error {
  RCTLogInfo(@"didDiscoverServices %@", [peripheral.identifier UUIDString]);
  for (CBService* service in peripheral.services) {
    [peripheral discoverCharacteristics:@[self.readerCounterUUID] forService:service];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverIncludedServicesForService:(CBService *)service
             error:(NSError *)error {
  RCTLogInfo(@"didDiscoverIncludedServicesForService");
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverCharacteristicsForService:(CBService *)service
             error:(NSError *)error {
  RCTLog(@"didDiscoverCharacteristicsForService %@ %@", [peripheral.identifier UUIDString], [service.UUID UUIDString]);
  if (error == nil) {
    for (CBCharacteristic *characteristic in service.characteristics) {
      if ([characteristic.UUID isEqual:self.readerCounterUUID] && characteristic.isNotifying == false) {
        [peripheral setNotifyValue:YES forCharacteristic:characteristic];
        [peripheral discoverCharacteristics:@[self.readerUUID] forService:service];
      } else if ([characteristic.UUID isEqual:self.readerUUID] && characteristic.isNotifying == false) {
        [peripheral setNotifyValue:YES forCharacteristic:characteristic];
      }
    }
  }
  
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
  RCTLogInfo(@"didDiscoverDescriptorsForCharacteristic %@", [characteristic.UUID UUIDString]);
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedDescription]);
  }
  if (characteristic.value != nil) {
    BertyDevice *device = [self.connectedDevice objectForKey:[peripheral.identifier UUIDString]];
    if ([characteristic.value bytes] == nil || ((char*)[characteristic.value bytes])[0] == 0) {
      RCTLogInfo(@"didUpdateValueForCharacteristic %@ %@", [characteristic.UUID UUIDString], [[NSString alloc] initWithData:device.data encoding:NSUTF8StringEncoding]);
    } else if (device != nil) {
      [device.data appendData:characteristic.value];
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateValueForDescriptor:(CBDescriptor *)descriptor
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"didUpdateValueForDescriptor %@", [descriptor.UUID UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
didWriteValueForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"didWriteValueForCharacteristic %@", characteristic.UUID);
}

- (void)peripheral:(CBPeripheral *)peripheral
didWriteValueForDescriptor:(CBDescriptor *)descriptor
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"didWriteValueForDescriptor %@", descriptor.UUID);
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"didUpdateNotificationStateForCharacteristic %@", [characteristic.UUID UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
       didReadRSSI:(NSNumber *)RSSI
             error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didReadRSSI");
}

- (void)peripheralDidUpdateName:(CBPeripheral *)peripheral {
  RCTLogInfo(@"peripheralDidUpdateName: %@", [peripheral.identifier UUIDString]);
}

- (void)peripheral:(CBPeripheral *)peripheral
 didModifyServices:(NSArray<CBService *> *)invalidatedServices {
  RCTLogInfo(@"didModifyServices");
}

- (void)peripheral:(CBPeripheral *)peripheral
didOpenL2CAPChannel:(CBL2CAPChannel *)channel
             error:(NSError *)error {
  RCTLogInfo(@"didOpenL2CAPChannel");
}

- (void)peripheralIsReadyToSendWriteWithoutResponse:(CBPeripheral *)peripheral {
  RCTLogInfo(@"peripheralIsReadyToSendWriteWithoutResponse");
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
      if (self.centralManager.state == CBCentralManagerStatePoweredOn) {
        [self.peripheralManager addService:self.bertyService];
      }
      break;
    default:
      stateString = @"State unknown, update imminent.";
      break;
  }

  RCTLogInfo(@"State change peripheral manager: %@", stateString);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
         willRestoreState:(NSDictionary<NSString *,id> *)dict {
  RCTLogInfo(@"Will restore State invoked");
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
            didAddService:(CBService *)service
                    error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"service added: %@", [service.UUID UUIDString]);
  [self.peripheralManager startAdvertising:@{
                                             CBAdvertisementDataServiceUUIDsKey:@[self.serviceUUID]
                                             }];
}

- (void)peripheralManagerDidStartAdvertising:(CBPeripheralManager *)peripheral
                                       error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"error: %@", [error localizedFailureReason]);
  }
  RCTLogInfo(@"peripheral start advertising %d", [peripheral isAdvertising]);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
                  central:(CBCentral *)central
didSubscribeToCharacteristic:(CBCharacteristic *)characteristic {
  RCTLogInfo(@"Subscription to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
                  central:(CBCentral *)central
didUnsubscribeFromCharacteristic:(CBCharacteristic *)characteristic {
  RCTLogInfo(@"Unsubscribed to characteristic: %@", characteristic.UUID);
}

- (void)peripheralManagerIsReadyToUpdateSubscribers:(CBPeripheralManager *)peripheral {
  RCTLogInfo(@"peripheralManagerIsReadyToUpdateSubscribers");
  [self sendWhatsLeft];
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
    didReceiveReadRequest:(CBATTRequest *)request {
  RCTLogInfo(@"request read %@", request);
}

- (void)peripheralManager:(CBPeripheralManager *)peripheral
  didReceiveWriteRequests:(NSArray<CBATTRequest *> *)requests {
  RCTLogInfo(@"request write %@", requests);
}

- (void)discoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic {
  RCTLogInfo(@"disco for charact %@", characteristic.UUID);
}

@end
