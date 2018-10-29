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

void init(char *ma, char *peerID);
int startAdvertising();
int startDiscover();
int isDiscovering();
int isAdvertising();
int dialPeer(char *peerID);
char *readPeerID(char *peerID);
NSData *Bytes2NSData(void *bytes, int length);
void writeNSData(NSData *data, char *ma);
void closeConn(char *ma);
int isClosed(char *ma);

@interface BertyCentralManager : NSObject <CBCentralManagerDelegate, CBPeripheralDelegate, CBPeripheralManagerDelegate>

@property (nonatomic, assign) BOOL serviceAdded;
@property (nonatomic, strong) NSMutableDictionary *bertyDevices;
@property (nonatomic, strong) NSMutableDictionary *oldDevices;
@property (nonatomic, strong) CBCentralManager *centralManager;
@property (nonatomic, strong) CBPeripheralManager *peripheralManager;
@property (nonatomic, strong) CBMutableService *bertyService;
@property (nonatomic, strong) CBMutableCharacteristic *acceptCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *maCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *peerIDCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *writerCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *isRdyCharacteristic;
@property (nonatomic, strong) CBMutableCharacteristic *closerCharacteristic;
@property (nonatomic, strong) NSString *ma;
@property (nonatomic, strong) NSString *peerID;
@property (nonatomic, strong) CBUUID *serviceUUID;
@property (nonatomic, strong) CBUUID *maUUID;
@property (nonatomic, strong) CBUUID *peerUUID;
@property (nonatomic, strong) CBUUID *dialUUID;
@property (nonatomic, strong) CBUUID *writerUUID;
@property (nonatomic, strong) CBUUID *isRdyUUID;
@property (nonatomic, strong) CBUUID *closerUUID;
@property (nonatomic, strong) CBUUID *acceptUUID;
@property (nonatomic, strong) NSMutableArray<NSData*>* toSend;
@property (atomic, readwrite, strong) dispatch_semaphore_t centralWaiter;

- (void)startAdvertising;
- (void)startDiscover;
- (instancetype)initWithMa:(NSString *)ma AndPeerID:(NSString *)peerID;
- (void)write:(NSData *)data forMa:(NSString *)ma;
- (int)dialPeer:(NSString *)peerID;
- (void)close:(NSString *)ma;
- (int)isClosed:(NSString *)ma;

@end


#endif /* ble_h */
