// +build darwin
//
//  main.m
//  kjh
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import "ble.h"
//#import "BertyUtils.h"
#import "BertyDevice.h"
//#import "BertyCentralManagerDelegate.h"
//#import "BleManager.m"
//#import "BertyPeripheralManagerDelegate.h"

static BleManager *manager = nil;

BleManager* getManager(void) {
//    NSLog(@"getting manager");
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[BleManager alloc] initScannerAndAdvertiser];
    });
//    NSLog(@"getting manager rey");
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
    NSLog(@"will set");
    [getManager() setMa:[NSString stringWithUTF8String:ma]];
    NSLog(@"SETTED3");
}

void setPeerID(char *peerID) {
    NSLog(@"will setbis");
    [getManager() setPeerID:[NSString stringWithUTF8String:peerID]];
    NSLog(@"SETTED");
}

void startScanning() {
    NSLog(@"startScanning()");
    [getManager() startScanning];
}

void startAdvertising() {
    NSLog(@"startAdvertising()");
    [manager startAdvertising];
}


void closeBle() {
//    if (centralManager != nil) {
//      stopScanning();
//    }
//    if (peripheralManager != nil) {
//      removeService();
//      stopAdvertising();
//    }
//    [BertyUtils removeAllDevices];
}

void addService() {
    [getManager() addService];
}

void removeService() {
//  if ([BertyUtils sharedUtils].serviceAdded == YES) {
//    [BertyUtils sharedUtils].serviceAdded = NO;
//    [peripheralManager removeService:[BertyUtils sharedUtils].bertyService];
//  }
}

void connDevice(CBPeripheral *peripheral) {
//    [centralManager connectPeripheral:peripheral options:nil];
}


int stopScanning() {
//    NSLog(@"stopScanning()");
//    if ([centralManager isScanning]) {
//        [centralManager stopScan];
//        return 1;
//    }
    return 0;
}

int isDiscovering() {
//    return (int)[centralManager isScanning];
    return 1;
}

int isAdvertising() {
//    return (int)[peripheralManager isAdvertising];
    return 1;
}

int stopAdvertising() {
    NSLog(@"stopAdvertising()");
//    if ([peripheralManager isAdvertising]) {
//        [peripheralManager stopAdvertising];
//        return 1;
//    }
    return 0;
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
//        NSLog(@"Success wirte");
        return;
    } else {
        NSLog(@"No device found can't write");
    }
}

int dialPeer(char *ma) {
    BertyDevice *bDevice = [getManager() findPeripheralFromMa:[NSString stringWithUTF8String:ma]];
    if (bDevice != nil) {
        return 1;
    }
    return 0;
}

void closeConn(char *ma) {
//    [bcm close:[NSString stringWithUTF8String:ma]];
    // TODO
}

int isClosed(char *ma) {
//    BertyDevice *bDevice = [BertyUtils getDeviceFromMa:[NSString stringWithUTF8String:ma]];
//    if (bDevice.peripheral.state == CBPeripheralStateConnected) {
//        return 0;
//    }
    return 1;
}
