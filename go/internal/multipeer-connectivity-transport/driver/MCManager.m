// +build darwin

#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "MCManager.h"
#import "mc-driver.h"

NSString *BERTY_DRIVER_MC = @"berty-mc";

@implementation MCManager

// MCPeerID must be unique and stable over time so we need to archive it after
// the first time it's created.
// https://developer.apple.com/documentation/multipeerconnectivity/mcpeerid
- (MCPeerID *)getMCPeerID:(NSString *)appPID {
    NSString *kAppPID = @"berty-peerID";
    NSString *kPIDData = @"berty-PIDData";
    
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *oldAppPID = [defaults stringForKey:kAppPID];
    MCPeerID *peerID;
    NSData *peerIDData;
    NSError *error;
     
    if ([oldAppPID isEqualToString:appPID]) {
        peerIDData = [defaults dataForKey:kPIDData];
        if ((peerID = [NSKeyedUnarchiver unarchivedObjectOfClass:[MCPeerID class] fromData:peerIDData error:&error])) {
            return (peerID);
        }
        NSLog(@"MC: getMCPeerID unarchive error: %@", error);
    }
    peerID = [[MCPeerID alloc] initWithDisplayName:appPID];
    if ((peerIDData = [NSKeyedArchiver archivedDataWithRootObject:peerID requiringSecureCoding:true error:&error])) {
        [defaults setObject:peerIDData forKey:kPIDData];
        [defaults setObject:appPID forKey:kAppPID];
        [defaults synchronize];
    } else {
        NSLog(@"MC: getMCPeerID archive error: %@", error);
    }
    return (peerID);
}

- (id)init:(NSString *)peerID {
    if (self = [super init]) {
        self.mPeerID = [[MCPeerID alloc] initWithDisplayName:peerID];
        if (!(self.mSession = [[MCSession alloc] initWithPeer:self.mPeerID securityIdentity:nil encryptionPreference:MCEncryptionRequired])) {
            NSLog(@"MC: MCSession init failed");
            return (self = nil);
        }
        self.mSession.delegate = self;
    }
    return (self);
}

- (int)startServiceAdvertiser {
    if (!(self.mServiceAdvertiser = [[MCNearbyServiceAdvertiser alloc] initWithPeer:self.mPeerID discoveryInfo:nil serviceType:BERTY_DRIVER_MC])) {
        NSLog(@"MC: MCNearbyServiceAdvertiser init failed");
        return (0);
    }
    self.mServiceAdvertiser.delegate = self;
    [self.mServiceAdvertiser startAdvertisingPeer];
    return (1);
}

- (int)startServiceBrowser {
    if (!(self.mServiceBrowser = [[MCNearbyServiceBrowser alloc] initWithPeer:self.mPeerID serviceType:BERTY_DRIVER_MC])) {
        NSLog(@"MC: MCNearbyServiceBrowser init failed");
        return (0);
    }
    self.mServiceBrowser.delegate = self;
    [self.mServiceBrowser startBrowsingForPeers];
    return (1);
}

- (void)stopServiceAdvertiser {
    [self.mServiceAdvertiser stopAdvertisingPeer];
    self.mServiceAdvertiser = nil;
}

- (void)stopServiceBrowser {
    [self.mServiceBrowser stopBrowsingForPeers];
    self.mServiceBrowser = nil;
}

- (void)closeSessions {
    [self.mSession disconnect];
}

- (int)sendToPeer: (NSString *)peerID data:(NSData *)data {
    NSError *error = nil;
    MCPeerID *peer;
    if ((peer = [self getPeer:peerID])) {
        NSArray *array = @[peer];
        if ([self.mSession sendData:data toPeers:array withMode:MCSessionSendDataReliable error:&error]) {
            return (1);
        }
        NSString *description = [error localizedDescription];
        NSString *reason = [error localizedFailureReason] ?
            [error localizedFailureReason] :
            NSLocalizedString(@"Unknown reason", nil);
        NSLog(@"MC: sendToPeer error: %@: %@", description, reason);
    }
    return (0);
}

- (MCPeerID *)getPeer:(NSString *)peerID {
    NSArray<MCPeerID *> *peers = [self.mSession connectedPeers];
    for (MCPeerID *peer in peers) {
        if ([[peer displayName] isEqualToString:peerID]) {
            return (peer);
        }
    }
    return (nil);
}

/*
                                MCSessionDelegate
 */

- (void)session:(MCSession *)session peer:(MCPeerID *)peerID didChangeState:(MCSessionState)state{
    switch (state) {
    case MCSessionStateConnecting:
            NSLog(@"MC: Connecting: %@", [peerID displayName]);
        break;
    case MCSessionStateConnected:
        NSLog(@"MC: Connected: %@", [peerID displayName]);
        BridgeHandleFoundPeer([peerID displayName]);
        break;
    case MCSessionStateNotConnected:
        NSLog(@"MC: Not connected: %@", [peerID displayName]);
		BridgeHandleLostPeer([peerID displayName]);
        break;
    }
}
 
- (void)session:(MCSession *)session didReceiveData:(NSData *)data fromPeer:(MCPeerID *)peerID{
    BridgeReceiveFromPeer([peerID displayName], data);
}
 
 
- (void)session:(MCSession *)session didStartReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID withProgress:(NSProgress *)progress{
    
}
 
 
- (void)session:(MCSession *)session didFinishReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID atURL:(NSURL *)localURL withError:(NSError *)error{
    
}
 
 
- (void)session:(MCSession *)session didReceiveStream:(NSInputStream *)stream withName:(NSString *)streamName fromPeer:(MCPeerID *)peerID{
    
}

/*
                                MCNearbyServiceAdvertiserDelegate
 */

- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didNotStartAdvertisingPeer:(NSError *)error {
    NSLog(@"MC: didNotStartAdvertisingPeer: %@", error);
}

- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didReceiveInvitationFromPeer:(MCPeerID *)peerID withContext:(NSData *)context invitationHandler:(void (^)(BOOL, MCSession * _Nullable))invitationHandler {
    NSLog(@"MC: didReceiveInvationFromPeer: %@", [peerID displayName]);
    invitationHandler(true, self.mSession);
}

/*
                                MCNearbyServiceBrowserDelegate
 */

- (void)browser:(MCNearbyServiceBrowser *)browser lostPeer:(MCPeerID *)peerID {
    NSLog(@"MC: lostPeer: %@", [peerID displayName]);
}

- (void)browser:(MCNearbyServiceBrowser *)browser didNotStartBrowsingForPeers:(NSError *)error {
    NSLog(@"MC: didNotStartBrowsingForPeers: %@", error);
}

- (void)browser:(MCNearbyServiceBrowser *)browser foundPeer:(MCPeerID *)peerID withDiscoveryInfo:(NSDictionary<NSString *,NSString *> *)info {
    NSLog(@"MC: foundPeer: %@", [peerID displayName]);
    [browser invitePeer:peerID toSession:self.mSession withContext:nil timeout:10];
}

@end
