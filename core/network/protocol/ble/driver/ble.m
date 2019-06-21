// +build darwin
//
//  main.m
//  kjh
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import <os/log.h>
#import "ble.h"
#import "BertyDevice.h"

static BleManager *manager = nil;

BleManager* getManager(void) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        os_log(OS_LOG_DEFAULT, "getManager() initialize!");
        manager = [[BleManager alloc] initScannerAndAdvertiser];
    });
    return manager;
}

void handleSigInt(int sig) {
    exit(-1);
}

void initSignalHandling() {
    signal(SIGINT, handleSigInt);
}

void handleException(NSException* exception) {
    NSLog(@"Unhandled exception %@", exception);
}

void InitScannerAndAdvertiser() {
    getManager();
    NSSetUncaughtExceptionHandler(handleException);
}

void setMa(char *ma) {
    os_log(OS_LOG_DEFAULT, "Own ma set: %@", [NSString stringWithUTF8String:ma]);
    [getManager() setMa:[NSString stringWithUTF8String:ma]];
}

void setPeerID(char *peerID) {
    os_log(OS_LOG_DEFAULT, "Own peerID set: %@", [NSString stringWithUTF8String:peerID]);
    [getManager() setPeerID:[NSString stringWithUTF8String:peerID]];
}

void startScanning() {
    os_log(OS_LOG_DEFAULT, "startScanning() called");
    [getManager() startScanning];
}

void startAdvertising() {
    os_log(OS_LOG_DEFAULT, "startAdvertising() called");
    [manager startAdvertising];
}

NSData *Bytes2NSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }

void writeNSData(NSData *data, char *ma) {
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
        return;
    } else {
        os_log_error(OS_LOG_DEFAULT, "writeNSData() no device found can't write");
    }
}

int dialPeer(char *ma) {
    BertyDevice *bDevice = [getManager() findPeripheralFromMa:[NSString stringWithUTF8String:ma]];
    if (bDevice != nil) {
        return 1;
    }
    return 0;
}

void closeConn(char *ma) { }

int isClosed(char *ma) { return 1; }

void closeBle() {}

void removeService() {}

void addService() {
    os_log(OS_LOG_DEFAULT, "addService() called");
    [getManager() addService];
}

void connDevice(CBPeripheral *peripheral) {}

int isDiscovering() { return 1; }

int isAdvertising() { return 1; }

int stopScanning() { return 0; }

int stopAdvertising() {
    os_log(OS_LOG_DEFAULT, "stopAdvertising() called");
    return 0;
}
