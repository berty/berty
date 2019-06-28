//
//  BleInterface.h
//  ble
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <os/log.h>
#import <signal.h>

#ifndef BleInterface_h
#define BleInterface_h
@class BleManager;

extern os_log_t OS_LOG_BLE;

unsigned short StartBleDriver(char *ma, char *peerID);
unsigned short StopBleDriver(void);
unsigned short DialDevice(char *ma);
unsigned short SendToDevice(char *ma, NSData *data);
void CloseConnWithDevice(char *ma);

BleManager* getManager(void);
void handleException(NSException* exception);
NSData *ConvertByteSliceToNSData(void *bytes, int length);
void FreeNSData(NSData *data);

#endif /* BleInterface_h */
