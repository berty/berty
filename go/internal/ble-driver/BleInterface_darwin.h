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

#define LOCAL_DOMAIN "tech.berty.bty.BLE"
extern os_log_t OS_LOG_BLE;

void BLEStart(char *localPID);
void BLEStop(void);
int BLESendToPeer(char *remotePID, void *payload, int length);
int BLEDialPeer(char *remotePID);
void BLECloseConnWithPeer(char *remotePID);
int BLEBridgeHandleFoundPeer(NSString *remotePID);
void BLEBridgeHandleLostPeer(NSString *remotePID);
void BLEBridgeReceiveFromPeer(NSString *remotePID, NSData *payload);

#endif /* BleInterface_h */
