//
//  ble.h
//  test
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#ifndef ble_h
#define ble_h

#import "BertyUtils.h"
#import "BertyCentralManagerDelegate.h"
#import "BertyPeripheralManagerDelegate.h"
#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "BertyDevice.h"

void init(char *ma, char *peerID);
int startAdvertising();
int startDiscover();
int isDiscovering();
void connDevice(CBPeripheral *peripheral);
int isAdvertising();
int dialPeer(char *peerID);
char *readPeerID(char *peerID);
NSData *Bytes2NSData(void *bytes, int length);
void writeNSData(NSData *data, char *ma);
void closeConn(char *ma);
int isClosed(char *ma);

#endif /* ble_h */
