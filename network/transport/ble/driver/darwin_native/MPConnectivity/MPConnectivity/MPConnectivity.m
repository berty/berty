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

extern int HandlePeerFound(char *);
extern void ReceiveFromPeer(char *, void *, unsigned long);

const char *MULTI_ADDRESS_NULL = "00000000-0000-0000-0000-000000000000";

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

int StartBleDriver(char *peerID) {
    NSLog(@"StartBleDriver called with: %s", peerID);
    if (!driverStarted) {
        NSString *cPeerID = [[NSString alloc] initWithUTF8String:peerID];
        if (!getManager(cPeerID)) {
            NSLog(@"StartBleDriver failed");
            return (0);
        }
        [gMPConnectivityManager startServiceAdvertiser];
        [gMPConnectivityManager startServiceBrowser];
        driverStarted = 1;
    }
	return (1);
}

int StopBleDriver() {
    NSLog(@"StopBleDriver called");
    if (driverStarted) {
        [gMPConnectivityManager stopServiceAdvertiser];
        [gMPConnectivityManager stopServiceBrowser];
        [gMPConnectivityManager closeSessions];
        driverStarted = 0;
    }
	return (1);
}

int SendToPeer(char *peerID, void *data, int length) {
    NSLog(@"SendToPeer called");
    NSString *cPeerID = [[NSString alloc] initWithUTF8String:peerID];
    NSData *cData = [[NSData alloc] initWithBytes:data length:length];
    return ([gMPConnectivityManager sendToPeer:cPeerID data:cData]);
}

int DialPeer(char *peerID) {
    NSLog(@"DialPeer called");
    NSString *cPeerID = [[NSString alloc] initWithUTF8String:peerID];
    if (![gMPConnectivityManager getPeer:cPeerID]) {
        return (0);
    }
	return (1);
}

void CloseConnWithPeer(char *peerID) {
    NSLog(@"CloseConnWithPeer called");
}

int BridgeHandlePeerFound(NSString *peerID) {
    char *cPeerID = (char *)[peerID UTF8String];
    if (HandlePeerFound(cPeerID)) {
        return (1);
    }
    return (0);
}

void BridgeReceiveFromPeer(NSString *peerID, NSData *payload) {
    char *cPeerID = (char *)[peerID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    ReceiveFromPeer(cPeerID, cPayload, length);
}
