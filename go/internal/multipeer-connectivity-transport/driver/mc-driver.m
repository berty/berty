// +build darwin

#import <os/log.h>
#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "mc-driver.h"
#import "MCManager.h"

// This functions are Go functions so they aren't defined here
extern int HandleFoundPeer(char *);
extern void HandleLostPeer(char *);
extern void ReceiveFromPeer(char *, void *, unsigned long);

int driverStarted = 0;

// MCManager must be unique
static MCManager *gMCManager = nil;
MCManager* getMCManager(NSString *peerID) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        gMCManager = [[MCManager alloc] init:peerID];
    });
    return gMCManager;
}

void StartMCDriver(char *localPID) {
    if (!driverStarted) {
        NSString *cPID = [[NSString alloc] initWithUTF8String:localPID];
        if (!getMCManager(cPID)) {
            NSLog(@"MC: StartMCDriver failed");
            return ;
        }
        [gMCManager startServiceAdvertiser];
        [gMCManager startServiceBrowser];
        driverStarted = 1;
    }
}

void StopMCDriver() {
    if (driverStarted) {
        [gMCManager stopServiceAdvertiser];
        [gMCManager stopServiceBrowser];
        [gMCManager closeSessions];
        driverStarted = 0;
    }
}

int SendToPeer(char *remotePID, void *payload, int length) {
    if (driverStarted) {
		NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
		NSData *cPayload = [[NSData alloc] initWithBytes:payload length:length];
		return ([gMCManager sendToPeer:cPID data:cPayload]);
	}
	return (0);
}

int DialPeer(char *remotePID) {
    NSString *cPID = [[NSString alloc] initWithUTF8String:remotePID];
    if (!driverStarted || ![gMCManager getPeer:cPID]) {
        return (0);
    }
	return (1);
}

// nothing to do because API doesn't provide any functions
void CloseConnWithPeer(char *peerID) {
}

int BridgeHandleFoundPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    if (HandleFoundPeer(cPID)) {
        return (1);
    }
    return (0);
}

void BridgeHandleLostPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    HandleLostPeer(cPID);
}

void BridgeReceiveFromPeer(NSString *remotePID, NSData *payload) {
    char *cPID = (char *)[remotePID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    ReceiveFromPeer(cPID, cPayload, length);
}
