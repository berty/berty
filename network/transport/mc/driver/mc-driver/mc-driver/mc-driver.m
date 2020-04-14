// +build darwin
//
//  mc-driver.m
//  mc-driver
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <os/log.h>
#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "mc-driver.h"
#import "MCManager.h"

extern int HandleFoundPeer(char *);
extern void ReceiveFromPeer(char *, void *, unsigned long);

static MCManager *gMCManager = nil;
int driverStarted = 0;

MCManager* getMCManager(NSString *peerID) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NSLog(@"getMCManager() initialize");
        gMCManager = [[MCManager alloc] init:peerID];
    });
    return gMCManager;
}

int StartMCDriver(char *localPID) {
    NSLog(@"StartBleDriver called with: %s", localPID);
    if (!driverStarted) {
        NSString *cPID = [[NSString alloc] initWithUTF8String:localPID];
        if (!getMCManager(cPID)) {
            NSLog(@"StartBleDriver failed");
            return (0);
        }
        [gMCManager startServiceAdvertiser];
        [gMCManager startServiceBrowser];
        driverStarted = 1;
    }
	return (1);
}

void StopMCDriver() {
    NSLog(@"StopBleDriver called");
    if (driverStarted) {
        [gMCManager stopServiceAdvertiser];
        [gMCManager stopServiceBrowser];
        [gMCManager closeSessions];
        driverStarted = 0;
    }
}

int SendToPeer(char *remotePID, void *payload, int length) {
    NSLog(@"SendToPeer called");
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
    return ([gMCManager sendToPeer:cPID data:cPayload]);
}

int DialPeer(char *remotePID) {
    NSLog(@"DialPeer called");
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    if (![gMCManager getPeer:cPID]) {
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
