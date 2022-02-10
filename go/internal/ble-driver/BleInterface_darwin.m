// +build darwin
//
//  BleInterface.m
//  ble
//
//  Created by sacha on 26/09/2018.
//  Copyright © 2018 sacha. All rights reserved.
//

#import "BleInterface_darwin.h"

// This functions are Go functions so they aren't defined here
extern int BLEHandleFoundPeer(char *);
extern void BLEHandleLostPeer(char *);
extern void BLEReceiveFromPeer(char *, void *, unsigned long);
extern void BLELog(enum level level, const char *message);

static BleManager *manager = nil;
BOOL useExternalLogger = FALSE;

void handleException(NSException* exception) {
    NSLog(@"Unhandled exception %@", exception);
}

BleManager* getManager(void) {
    @synchronized([BleManager class])
    {
        if(!manager) {
            NSLog(@"BleManager: initialization");
            manager = [[BleManager alloc] initDriver:useExternalLogger];
        }
    }
    return manager;
}

void releaseManager(void) {
    @synchronized([BleManager class])
    {
        if(manager) {
            NSLog(@"releaseManager");
            [manager release];
            manager = nil;
        }
    }
}

#pragma mark - incoming API functions

void BLEStart(char *localPID) {
    NSLog(@"BLEStart called");
    @autoreleasepool {
        NSString *localPIDString = [NSString stringWithUTF8String:localPID];
        [getManager() setLocalPID:localPIDString];
        [getManager().logger i:@"BLEStart: pid=%@", [getManager().logger SensitiveNSObject:localPIDString]];
        [getManager() setID:[localPIDString substringWithRange:NSMakeRange([localPIDString length] - 4, 4)]];
        [getManager() startScanning];
        [getManager() startAdvertising];
        NSSetUncaughtExceptionHandler(handleException);
    }
}

// TODO: Implement this, check if error
void BLEStop(void) {
    [getManager().logger i:@"BLEStop"];
    [getManager() stopScanning];
    [getManager() stopAdvertising];
    [getManager() closeAllConnections];
    releaseManager();
}

int BLESendToPeer(char *remotePID, void *payload, int length) {
    int status = 0;
    
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
    
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:cPID];
    if (bDevice == nil) {
        [getManager().logger e:@"BLESendToPeer error: no device found"];
        return 0;
    }
    
    if (bDevice.peer == nil) {
        [getManager().logger e:@"BLESendToPeer error: peer object not found"];
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
            [getManager().logger e:@"BLESendToPeer error: device not connected"];
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
    [getManager().logger i:@"BLECloseConnWithPeer called: remotePID=%@", [getManager().logger SensitiveString:remotePID]];
    BertyDevice *bDevice = [getManager() findPeripheralFromPID:[NSString stringWithUTF8String:remotePID]];
    if (bDevice != nil) {
        [getManager() disconnect:bDevice];
    }
}


// Use BLEBridgeLog to write logs to the external logger
void BLEUseExternalLogger(void) {
    useExternalLogger = TRUE;
}

#pragma mark - outgoing API functions

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

// Write logs to the external logger
void BLEBridgeLog(enum level level, NSString *message) {
    char *cMessage = (char *)[message UTF8String];
    BLELog(level, cMessage);
}
