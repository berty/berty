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

unsigned short StartBleDriver(char *localPID);
void StopBleDriver(void);
unsigned short DialPeer(char *remotePID);
unsigned short SendToPeer(char *remotePID, NSData *payload);
void CloseConnWithPeer(char *remotePID);

BleManager* getManager(void);
void handleException(NSException* exception);
NSData *ConvertByteSliceToNSData(void *bytes, int length);
void FreeNSData(NSData *data);

#endif /* BleInterface_h */
