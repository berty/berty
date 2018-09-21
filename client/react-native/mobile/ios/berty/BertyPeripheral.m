//
//  BertyPeripheral.m
//  bluetooth
//
//  Created by sacha on 14/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "BertyPeripheral.h"
#import <React/RCTLog.h>

@implementation BertyPeripheral

- (instancetype)initWithPeripheral:(CBPeripheral*)me {
  self.me = me;
  [me setDelegate:self];
  return self;
}


- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverServices:(NSError *)error {
  RCTLogInfo(@"didDiscoverServices %@", peripheral.services);
  CBService *service;
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  for (service in peripheral.services) {
    [peripheral discoverCharacteristics:nil forService:service];
    //    [peripheral read]
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
  didDiscoverIncludedServicesForService:(CBService *)service
                error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didDiscoverIncludedServicesForService");
}

- (void)peripheral:(CBPeripheral *)peripheral
  didDiscoverCharacteristicsForService:(CBService *)service
                error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  //  RCTLogInfo(@"didDiscoverCharacteristicsForService %@", service);
  //  RCTLogInfo(@"didDiscoverCharacteristicsForService %@", service.characteristics);
  CBCharacteristic *characteristic;
  for (characteristic in service.characteristics) {
    //    [peripheral setNotifyValue:true forCharacteristic:characteristic];
    //    [peripheral readValueForCharacteristic:characteristic];
    [peripheral discoverDescriptorsForCharacteristic:characteristic];
    if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:@"0b89d2d4-0ea6-4141-86bb-0c5fb91ab14a"]]) {
      RCTLogInfo(@"WRITE TO %@", characteristic.UUID);
      [peripheral writeValue:[@"test" dataUsingEncoding:NSUTF8StringEncoding] forCharacteristic:characteristic type:CBCharacteristicWriteWithoutResponse];
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didDiscoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic
              error:(NSError *)error {
  RCTLogInfo(@"didDiscoverDescriptorsForCharacteristic %@", characteristic.UUID);
  RCTLogInfo(@"didDiscoverDescriptorsForCharacteristic %@", characteristic.descriptors);
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  CBDescriptor *desc;
  NSString *test = @"testtesttesttesttest1234";
  for (desc in characteristic.descriptors) {
    //    RCTLogInfo(@"GO);
    //    if (desc.)
    //    [peripheral writeValue:[test dataUsingEncoding:NSUTF8StringEncoding] forDescriptor:desc];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic
              error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didUpdateValueForCharacteristic %@", characteristic.UUID);
  CBDescriptor *desc;
  for (desc in characteristic.descriptors) {
    //    if (desc.)
    //    [peripheral writeValue:[test dataUsingEncoding:NSUTF8StringEncoding] forDescriptor:desc];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateValueForDescriptor:(CBDescriptor *)descriptor
              error:(NSError *)error {
  RCTLogInfo(@"didUpdateValueForDescriptor %@", descriptor.UUID);
  [peripheral readValueForDescriptor:descriptor];
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didDiscoverDescriptorsForCharacteristicsssss %@", descriptor.value);
  //    if (desc.)
  //    [peripheral writeValue:[test dataUsingEncoding:NSUTF8StringEncoding] forDescriptor:desc];
}

- (void)peripheral:(CBPeripheral *)peripheral
didWriteValueForCharacteristic:(CBCharacteristic *)characteristic
              error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didWriteValueForCharacteristic %@", characteristic.UUID);
  //  [peripheral setNotifyValue:true forCharacteristic:characteristic];
}

- (void)peripheral:(CBPeripheral *)peripheral
didWriteValueForDescriptor:(CBDescriptor *)descriptor
              error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didWriteValueForDescriptor %@", descriptor.UUID);
}

- (void)peripheral:(CBPeripheral *)peripheral
didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic
              error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didUpdateNotificationStateForCharacteristic %@", characteristic.UUID);
}

- (void)peripheral:(CBPeripheral *)peripheral
          didReadRSSI:(NSNumber *)RSSI
              error:(NSError *)error {
  if (error) {
    RCTLogWarn(@"fdp: %@", [error localizedDescription]);
  }
  RCTLogInfo(@"didReadRSSI");
}

- (void)peripheralDidUpdateName:(CBPeripheral *)peripheral {
  RCTLogInfo(@"peripheralDidUpdateName: %@", peripheral.identifier);
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

@end
