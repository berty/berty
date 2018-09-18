//
//  BertyCentralManager.h
//  bluetooth
//
//  Created by sacha on 05/09/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTEventEmitter.h>
#import "BertyPeripheral.h"
#import "BertyDevice.h"

@interface BertyCentralManager : NSObject <CBCentralManagerDelegate, CBPeripheralDelegate, CBPeripheralManagerDelegate>

@property (nonatomic, strong) NSMutableDictionary *connectedDevice;
@property (nonatomic, strong) NSMutableDictionary *discoveredDevice;
@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, strong) CBPeripheralManager *peripheralManager;
@property (nonatomic, strong) CBMutableService *bertyService;
@property (nonatomic, strong) CBMutableCharacteristic *bertyReaderCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *bertyCounterReaderCharacteristic;
@property (nonatomic, strong) CBUUID *serviceUUID;
@property (nonatomic, strong) CBUUID *readerUUID;
@property (nonatomic, strong) CBUUID *readerCounterUUID;
@property (nonatomic, weak) id sender;

- (instancetype)initWithSender:(id)sender;
- (void)discover;
- (void)connect:(NSString *)name;
- (void)writeTo:(NSString *)addr msg:(NSString *)msg;
- (void)subscribe;
- (void) updateValue ;
@end

