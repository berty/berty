// +build darwin
//
//  main.m
//  kjh
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import "ble.h"
#import "BertyUtils.h"
#import "BertyDevice.h"
#import "BertyCentralManagerDelegate.h"
#import "BertyPeripheralManagerDelegate.h"

CBCentralManager *centralManager;
CBPeripheralManager *peripheralManager;
BertyPeripheralManagerDelegate *BPMD;
BertyCentralManagerDelegate *BCMD;

void handleSigInt(int sig) {
    exit(-1);
}

void initSignalHandling() {
    signal(SIGINT, handleSigInt);
}

void handleException(NSException* exception) {
    NSLog(@"Unhandled exception %@", exception);
}

void init() {
    if (centralManager == nil && peripheralManager == nil) {
        BertyPeripheralDelegate *peripheralDelegate = [[BertyPeripheralDelegate alloc] init];

        BCMD = [[BertyCentralManagerDelegate alloc]initWithPeripheralDelegate:peripheralDelegate];

        BPMD = [[BertyPeripheralManagerDelegate alloc]initWithPeripheralDelegate:peripheralDelegate];

        centralManager = [[CBCentralManager alloc]
                          initWithDelegate:BCMD
                          queue:dispatch_queue_create("CentralManager", DISPATCH_QUEUE_SERIAL)
                          options:@{CBCentralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}
                          ];

        peripheralManager = [[CBPeripheralManager alloc]
                             initWithDelegate:BPMD
                             queue:dispatch_queue_create("PeripheralManager", DISPATCH_QUEUE_SERIAL)
                             options:@{CBPeripheralManagerOptionShowPowerAlertKey:[NSNumber numberWithBool:YES]}];

        [BCMD centralManagerDidUpdateState:centralManager];
        [BPMD peripheralManagerDidUpdateState:peripheralManager];

        NSSetUncaughtExceptionHandler(handleException);
        initSignalHandling();
    }
}

void addService() {
  if ([BertyUtils sharedUtils].serviceAdded == NO) {
    [BertyUtils sharedUtils].serviceAdded = YES;
    [peripheralManager addService:[BertyUtils sharedUtils].bertyService];
  }
}

void setMa(char *ma) {
  [BertyUtils setMa:[NSString stringWithUTF8String:ma]];
}

void setPeerID(char *peerID) {
  [BertyUtils setPeerID:[NSString stringWithUTF8String:peerID]];
}

int centralManagerIsOn(void) {
    return (int)[BertyUtils sharedUtils].CentralIsOn;
}

int peripheralManagerIsOn(void) {
    return (int)[BertyUtils sharedUtils].PeripharalIsOn;
}

void connDevice(CBPeripheral *peripheral) {
    [centralManager connectPeripheral:peripheral options:nil];
}

int startScanning() {
    NSLog(@"startScanning()");
    if (![centralManager isScanning]) {
        NSDictionary *options = [NSDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithBool:YES], CBCentralManagerScanOptionAllowDuplicatesKey, nil];
        [centralManager scanForPeripheralsWithServices: @[[BertyUtils sharedUtils].serviceUUID] options:options];
        return 1;
    }
    return 0;
}

int isDiscovering() {
    return (int)[centralManager isScanning];
}

int isAdvertising() {
    return (int)[peripheralManager isAdvertising];
}

int startAdvertising() {
    NSLog(@"startAdvertising()");
    if (![peripheralManager isAdvertising]) {
        [peripheralManager startAdvertising:@{CBAdvertisementDataServiceUUIDsKey:@[[BertyUtils sharedUtils].serviceUUID]}];
        return 1;
    }
    return 0;
}

NSData *Bytes2NSData(void *bytes, int length) { return [NSData dataWithBytes:bytes length:length]; }

void writeNSData(NSData *data, char *ma) {
    BertyDevice *bDevice = [BertyUtils getDeviceFromMa:[NSString stringWithUTF8String:ma]];
    [bDevice write:data];
}

int dialPeer(char *peerID) {
    if ([BertyUtils inDevicesWithMa:[NSString stringWithUTF8String:peerID]] == YES) {
        NSLog(@"TEST 1 %@", [NSString stringWithUTF8String:peerID]);
        return 1;
    }
    NSLog(@"TEST 0 %@", [NSString stringWithUTF8String:peerID]);
    return 0;
}

void closeConn(char *ma) {
//    [bcm close:[NSString stringWithUTF8String:ma]];
    // TODO
}

int isClosed(char *ma) {
    BertyDevice *bDevice = [BertyUtils getDeviceFromMa:[NSString stringWithUTF8String:ma]];
    if (bDevice.peripheral.state == CBPeripheralStateConnected) {
        return 0;
    }
    return 1;
}
