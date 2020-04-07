// +build darwin
//
//  MPConnectivity.m
//  MPConnectivity
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <os/log.h>
#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "MPConnectivity.h"
#import "MPConnectivityManager.h"

extern int HandleFoundPeer(char *);
extern void ReceiveFromPeer(char *, void *, unsigned long);

static MPConnectivityManager *gMPConnectivityManager = nil;
int driverStarted = 0;

MPConnectivityManager* getManager(NSString *peerID) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NSLog(@"getManager() initialize");
        gMPConnectivityManager = [[MPConnectivityManager alloc] init:peerID];
    });
    return gMPConnectivityManager;
}

int StartBleDriver(char *localPID) {
    NSLog(@"StartBleDriver called with: %s", localPID);
    if (!driverStarted) {
        NSString *cPID = [[NSString alloc] initWithUTF8String:localPID];
        if (!getManager(cPID)) {
            NSLog(@"StartBleDriver failed");
            return (0);
        }
        [gMPConnectivityManager startServiceAdvertiser];
        [gMPConnectivityManager startServiceBrowser];
        driverStarted = 1;
    }
	return (1);
}

void StopBleDriver() {
    NSLog(@"StopBleDriver called");
    if (driverStarted) {
        [gMPConnectivityManager stopServiceAdvertiser];
        [gMPConnectivityManager stopServiceBrowser];
        [gMPConnectivityManager closeSessions];
        driverStarted = 0;
    }
}

int SendToPeer(char *remotePID, void *payload, int length) {
    NSLog(@"SendToPeer called");
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
    return ([gMPConnectivityManager sendToPeer:cPID data:cPayload]);
}

int DialPeer(char *remotePID) {
    NSLog(@"DialPeer called");
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    if (![gMPConnectivityManager getPeer:cPID]) {
        return (0);
    }
	return (1);
}

void CloseConnWithPeer(char *peerID) {
    NSLog(@"CloseConnWithPeer called");
}

int BridgeHandleFoundPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    if (HandleFoundPeer(cPID)) {
        return (1);
    }
    return (0);
}

void BridgeReceiveFromPeer(NSString *remotePID, NSData *payload) {
    char *cPID = (char *)[remotePID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    ReceiveFromPeer(cPID, cPayload, length);
}
