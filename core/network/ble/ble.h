//
//  ble.h
//  test
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#ifndef ble_h
#define ble_h

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "BertyDevice.h"

void init(char *);
void startAdvertising();
void startDiscover();
extern void* sendAcceptToListenerForPeerID(char *, char *);

@interface BertyCentralManager : NSObject <CBCentralManagerDelegate, CBPeripheralDelegate, CBPeripheralManagerDelegate>

@property (nonatomic, assign) BOOL serviceAdded;
@property (nonatomic, strong) NSMutableDictionary *connectedDevice;
@property (nonatomic, strong) NSMutableDictionary *discoveredDevice;
@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, strong) CBPeripheralManager *peripheralManager;
@property (nonatomic, strong) CBMutableService *bertyService;
@property (nonatomic, strong) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *bertyReaderCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *bertyCounterReaderCharacteristic;
@property (nonatomic, strong) NSString *peerID;
@property (nonatomic, strong) CBUUID *serviceUUID;
@property (nonatomic, strong) CBUUID *peerIDUUID;
@property (nonatomic, strong) CBUUID *readerUUID;
@property (nonatomic, strong) CBUUID *readerCounterUUID;
@property (nonatomic, strong) NSMutableArray<NSData*>* toSend;

- (void)startAdvertising;
- (void)startDiscover;

@end


#endif /* ble_h */
