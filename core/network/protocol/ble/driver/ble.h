//
//  ble.h
//  test
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <signal.h>

#ifndef ble_h
#define ble_h
@class BleManager;

BleManager* getManager(void);
void handleSigInt(int sig);
void initSignalHandling(void);
void handleException(NSException* exception);
void InitScannerAndAdvertiser(void);
void setMa(char *ma);
void setPeerID(char *peerID);
void startScanning(void);
void startAdvertising(void);
NSData *Bytes2NSData(void *bytes, int length);
void writeNSData(NSData *data, char *ma);
int dialPeer(char *ma);
void closeConn(char *ma);
int isClosed(char *ma);
void closeBle(void);
void removeService(void);
void addService(void);
void connDevice(CBPeripheral *peripheral);
int isDiscovering(void);
int isAdvertising(void);
int stopScanning(void);
int stopAdvertising(void);

#endif /* ble_h */
