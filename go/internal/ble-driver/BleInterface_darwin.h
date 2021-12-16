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

#import "BleManager_darwin.h"
#import "Logger.h"

#ifndef BleInterface_h
#define BleInterface_h

void BLEStart(char *localPID);
void BLEStop(void);
int BLESendToPeer(char *remotePID, void *payload, int length);
int BLEDialPeer(char *remotePID);
void BLECloseConnWithPeer(char *remotePID);
int BLEBridgeHandleFoundPeer(NSString *remotePID);
void BLEBridgeHandleLostPeer(NSString *remotePID);
void BLEBridgeReceiveFromPeer(NSString *remotePID, NSData *payload);
void BLEBridgeLog(enum level level, NSString *message);
void BLEUseExternalLogger(void);

#endif /* BleInterface_h */
