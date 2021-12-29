// +build darwin

#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "mc-driver.h"
#import "MCManager.h"

// This functions are Go functions so they aren't defined here
extern int MCHandleFoundPeer(char *);
extern void MCHandleLostPeer(char *);
extern void MCReceiveFromPeer(char *, void *, unsigned long);
extern void MCLog(enum level level, const char *message);

int driverStarted = 0;
BOOL gMCUseExternalLogger = FALSE;

// MCManager must be unique
static MCManager *gMCManager = nil;
MCManager* getMCManager(NSString *peerID) {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
		NSLog(@"init MCManager");
        gMCManager = [[MCManager alloc] init:peerID useExternalLogger:gMCUseExternalLogger];
    });
    return gMCManager;
}

void StartMCDriver(char *localPID) {
    if (!driverStarted) {
		NSLog(@"StartMCDriver()");
        NSString *cPID = [[NSString alloc] initWithUTF8String:localPID];
        if (!getMCManager(cPID)) {
           NSLog(@"StartMCDriver failed");
            return ;
        }
        [gMCManager startServiceAdvertiser];
        [gMCManager startServiceBrowser];
        driverStarted = 1;
    }
}

void StopMCDriver() {
    if (driverStarted) {
		NSLog(@"StopMCDriver()");
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

// Use MCBridgeLog to write logs to the external logger
void MCUseExternalLogger(void) {
    gMCUseExternalLogger = TRUE;
}

int BridgeHandleFoundPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    if (MCHandleFoundPeer(cPID)) {
        return (1);
    }
    return (0);
}

void BridgeHandleLostPeer(NSString *remotePID) {
    char *cPID = (char *)[remotePID UTF8String];
    MCHandleLostPeer(cPID);
}

void BridgeReceiveFromPeer(NSString *remotePID, NSData *payload) {
    char *cPID = (char *)[remotePID UTF8String];
    char *cPayload = (char *)[payload bytes];
    int length = (int)[payload length];
    MCReceiveFromPeer(cPID, cPayload, length);
}

// Write logs to the external logger
void MCBridgeLog(enum level level, NSString *message) {
    char *cMessage = (char *)[message UTF8String];
    MCLog(level, cMessage);
}