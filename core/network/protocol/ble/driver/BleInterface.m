// +build darwin
//
//  BleInterface.m
//  ble
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import <os/log.h>
#import "BleInterface.h"
#import "BertyDevice.h"

static BleManager *manager = nil;
os_log_t OS_LOG_BLE = nil;

BleManager* getManager(void) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log(OS_LOG_BLE, "getManager() initialize!");
        manager = [[BleManager alloc] initScannerAndAdvertiser];
    });
    return manager;
}

// TODO: Check if init failed
unsigned short StartBleDriver(char *ma, char *peerID) {
    OS_LOG_BLE = os_log_create("chat.berty.io.core.network.protocol.ble.driver", "CoreModule");
    [getManager() setMa:[NSString stringWithUTF8String:ma]];
    [getManager() setPeerID:[NSString stringWithUTF8String:peerID]];
    [getManager() startScanning];
    [getManager() startAdvertising];
    NSSetUncaughtExceptionHandler(handleException);
    return 1;
}

// TODO: Implement this, check if error
unsigned short StopBleDriver(void) {
    return 1;
}

unsigned short DialDevice(char *ma) {
    BertyDevice *bDevice = [getManager() findPeripheralFromMa:[NSString stringWithUTF8String:ma]];
    if (bDevice != nil) {
        return 1;
    }
    return 0;
}

// TODO: Check if write succeeded?
unsigned short SendToDevice(char *ma, NSData *data) {
    BertyDevice *bDevice = [getManager() findPeripheralFromMa:[NSString stringWithUTF8String:ma]];
    if (bDevice != nil) {
        __block NSError *blockError = nil;
        dispatch_semaphore_t sema = dispatch_semaphore_create(0);

        [bDevice writeToCharacteristic:[NSMutableData dataWithData:data] forCharacteristic:bDevice.writer withEOD:FALSE andBlock:^(NSError *error) {
            blockError = error;
            dispatch_semaphore_signal(sema);
        }];
        dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
        dispatch_release(sema);
        return 1;
    }

    os_log_error(OS_LOG_BLE, "writeNSData() no device found can't write");
    return 0;
}

// TODO: Implement this
void CloseConnWithDevice(char *ma) {
}

void handleException(NSException* exception) {
    NSLog(@"Unhandled exception %@", exception);
}

// Functions that allow to use golang byte slice as Objective-C NSData*
NSData *ConvertByteSliceToNSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }
void FreeNSData(NSData *data) { [data release]; }
