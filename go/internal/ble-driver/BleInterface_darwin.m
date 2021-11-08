// +build darwin
//
//  BleInterface.m
//  ble
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import <os/log.h>
#import "BleInterface_darwin.h"
#import "BertyDevice_darwin.h"
#import "ConnectedPeer.h"

// This functions are Go functions so they aren't defined here
extern int BLEHandleFoundPeer(char *);
extern void BLEHandleLostPeer(char *);
extern void BLEReceiveFromPeer(char *, void *, unsigned long);

os_log_t OS_LOG_BLE = nil;

void handleException(NSException* exception) {
    os_log_error(OS_LOG_BLE, "🔴 Unhandled exception %{public}@", exception);
}

BleManager* getManager(void) {
    static BleManager *manager = nil;

    @synchronized([BleManager class])
    {
        if(!manager) {
            os_log(OS_LOG_BLE, "BleManager: initialization");
            manager = [[BleManager alloc] initScannerAndAdvertiser];
        }
    }
    return manager;
}

void BLEStart(char *localPID) {
    OS_LOG_BLE = os_log_create(LOCAL_DOMAIN, "protocol");
    os_log_debug(OS_LOG_BLE, "🟢 BLEStart()");
    @autoreleasepool {
        NSString *localPIDString = [NSString stringWithUTF8String:localPID];
        [getManager() setLocalPID:localPIDString];
        [getManager() setID:[localPIDString substringWithRange:NSMakeRange([localPIDString length] - 4, 4)]];
        [getManager() startScanning];
        [getManager() startAdvertising];
        NSSetUncaughtExceptionHandler(handleException);
    }
}

// TODO: Implement this, check if error
void BLEStop(void) {
    os_log_debug(OS_LOG_BLE, "🟢 BLEStop()");
    [getManager() stopScanning];
    [getManager() stopAdvertising];
    [getManager() closeAllConnections];
}

int BLESendToPeer(char *remotePID, void *payload, int length) {
    int status = 0;
    
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
    
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:cPID];
    if (bDevice == nil) {
        os_log_error(OS_LOG_BLE, "BLESendToPeer error: no device found");
        return 0;
    }
    
    if (bDevice.peer == nil) {
        os_log_error(OS_LOG_BLE, "BLESendToPeer error: peer object not found");
        return 0;
    }
    
    if (bDevice.useL2cap && bDevice.l2capChannel != nil) {
        status = [bDevice l2capWrite:cPayload];
    } else {
        if ([bDevice.peer isClientReady]) {
            status = [bDevice writeToCharacteristic:cPayload forCharacteristic:bDevice.writerCharacteristic withEOD:FALSE];
        } else if ([bDevice.peer isServerReady]) {
            status = [getManager() writeAndNotify:bDevice data:cPayload];
        } else {
            os_log_error(OS_LOG_BLE, "BLESendToPeer error: device not connected");
        }
    }
    
    [cPID release];
    [cPayload release];
    return status;
}

int BLEDialPeer(char *remotePID) {
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:[NSString stringWithUTF8String:remotePID]];
    if (bDevice != nil) {
        return 1;
    }
    return 0;
}

// TODO: Implement this
void BLECloseConnWithPeer(char *remotePID) {
    os_log_error(OS_LOG_BLE, "🟢 BLECloseConnWithPeer()");
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:[NSString stringWithUTF8String:remotePID]];
    if (bDevice != nil) {
        [getManager() disconnect:bDevice];
    }
}

int BLEBridgeHandleFoundPeer(NSString *remotePID) {
    os_log_debug(OS_LOG_BLE, "BLEBridgeHandleFoundPeer called");
    char *cPID = (char *)[remotePID UTF8String];
    if (BLEHandleFoundPeer(cPID)) {
        return (1);
    }
    return (0);
}

void BLEBridgeHandleLostPeer(NSString *remotePID) {
    os_log_debug(OS_LOG_BLE, "BLEBridgeHandleLostPeer called");
    char *cPID = (char *)[remotePID UTF8String];
    BLEHandleLostPeer(cPID);
}

void BLEBridgeReceiveFromPeer(NSString *remotePID, NSData *payload) {
    char *cPID = (char *)[remotePID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    BLEReceiveFromPeer(cPID, cPayload, length);
}
