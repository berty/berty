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
#import "BleManager.h"

#ifndef ble_h
#define ble_h

#define _BERTY_ON_MAIN_THREAD(block) dispatch_async(dispatch_get_main_queue(), block)

void closeBle(void);
int stopAdvertising(void);
int stopScanning(void);
int isDiscovering(void);
int centralManagerGetState(void);
int peripheralManagerGetState(void);
void addService(void);
void removeService(void);
void connDevice(CBPeripheral *peripheral);
int isAdvertising(void);
char *readPeerID(char *peerID);
NSData *Bytes2NSData(void *bytes, int length);
void writeNSData(NSData *data, char *ma);
void closeConn(char *ma);
int isClosed(char *ma);



/*
 var SetMa func(string) = nil
 var SetPeerID func(string) = nil
 var StartScanning func() = nil
 var StartAdvertising func() = nil
 var Write func(p []byte, ma string) bool = nil
 var DialPeer func(ma string) bool = nil
 var InitScannerAndAdvertiser func() = nil
 var CloseScannerAndAdvertiser func() = nil
 var CloseConnFromMa func(ma string) = nil
 */

void setMa(char *);
void setPeerID(char *);
void startScanning(void);
void startAdvertising(void);
bool dialPeer(char *);
void InitScannerAndAdvertiser(void);
void CloseScannerAndAdvertiser(void);
void CloseConnFromMa(char *);


#endif /* ble_h */
