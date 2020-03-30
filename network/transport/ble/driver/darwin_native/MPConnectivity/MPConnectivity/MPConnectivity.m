// +build darwin
//
//  MPConnectivity.m
//  MPConnectivity
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <os/log.h>
#import "MPConnectivity.h"

extern int handlePeerFound(char *, char *);
extern void ReceiveFromDevice(char *, void *, int);

int StartBleDriver(char *addr, char *peerId) {
    NSLog(@"StartBleDriver called");
	return (0);
}

int StopBleDriver() {
    NSLog(@"StopBleDriver called");
	return (0);
}

int SendToDevice(char *addr, void *data, int length) {
    NSLog(@"SendToDevice called");
	return (0);
}

int DialDevice(char *addr) {
    NSLog(@"DialDevice called");
	return (0);
}

void CloseConnWithDevice(char *addr) {
    NSLog(@"CloseConnWithDevice called");
}
