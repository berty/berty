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

// This functions are Go functions so they aren't defined here
extern int BLEHandleFoundPeer(char *);
extern void BLEHandleLostPeer(char *);
extern void BLEReceiveFromPeer(char *, void *, unsigned long);

static BleManager *manager = nil;
os_log_t OS_LOG_BLE = nil;

void handleException(NSException* exception) {
    os_log_error(OS_LOG_BLE, "Unhandled exception %{public}@", exception);
}

BleManager* getManager(void) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log(OS_LOG_BLE, "getManager() initialize");
        manager = [[BleManager alloc] initScannerAndAdvertiser];
    });
    return manager;
}

void BLEStart(char *localPID) {
    OS_LOG_BLE = os_log_create("tech.berty.bty.BLE", "protocol");
    os_log_debug(OS_LOG_BLE, "BLEStart()");
    [getManager() setPeerID:[NSString stringWithUTF8String:localPID]];
    [getManager() startScanning];
    [getManager() startAdvertising];
    NSSetUncaughtExceptionHandler(handleException);
}

// TODO: Implement this, check if error
void BLEStop(void) {
    os_log_debug(OS_LOG_BLE, "BLEStop()");
    [getManager() stopScanning];
    [getManager() stopAdvertising];
    [getManager() cancelAllPeripheralConnections];
}

// TODO: Check if write succeeded?
int BLESendToPeer(char *remotePID, void *payload, int length) {
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:cPID];
    if (bDevice != nil) {
        __block NSError *blockError = nil;
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);

        [bDevice writeToCharacteristic:[NSMutableData dataWithData:cPayload] forCharacteristic:bDevice.writer withEOD:FALSE andBlock:^(NSError *error) {
            blockError = [error copy];
            dispatch_semaphore_signal(sema);
        }];
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
        dispatch_release(sema);
        if (blockError == nil) {
            return 1;
        }
    }

    os_log_error(OS_LOG_BLE, "writeNSData() no device found can't write");
    return 0;
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
    os_log_error(OS_LOG_BLE, "BLECloseConnWithPeer()");
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:[NSString stringWithUTF8String:remotePID]];
    if (bDevice != nil) {
        [getManager() cancelPeripheralConnection:bDevice.peripheral];
    }
}

int BLEBridgeHandleFoundPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    if (BLEHandleFoundPeer(cPID)) {
        return (1);
    }
    return (0);
}

void BLEBridgeHandleLostPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    BLEHandleLostPeer(cPID);
}

void BLEBridgeReceiveFromPeer(NSString *remotePID, NSData *payload) {
    char *cPID = (char *)[remotePID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    BLEReceiveFromPeer(cPID, cPayload, length);
}
