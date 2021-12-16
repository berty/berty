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
        [self.logger d:@"getMCPeerID unarchive error: %@", error];
    }
    peerID = [[MCPeerID alloc] initWithDisplayName:appPID];
    if ((peerIDData = [NSKeyedArchiver archivedDataWithRootObject:peerID requiringSecureCoding:true error:&error])) {
        [defaults setObject:peerIDData forKey:kPIDData];
        [defaults setObject:appPID forKey:kAppPID];
        [defaults synchronize];
    } else {
        [self.logger d:@"getMCPeerID archive error: %@", error];
    }
    return (peerID);
}

- (id)init:(NSString *)peerID useExternalLogger:(BOOL)useExternalLogger {
    if (self = [super init]) {
        _mPeerID = [[MCPeerID alloc] initWithDisplayName:peerID];

        BOOL showSensitiveData = FALSE;
        if (useExternalLogger) {
            _logger = [[Logger alloc] initWithExternalLoggerAndShowSensitiveData:showSensitiveData];
        } else {
            _logger = [[Logger alloc] initLocalLoggerWithSubSystem:"tech.berty.bty" andCategorie:"MC" showSensitiveData:showSensitiveData];
        }

        if (!(self.mSession = [[MCSession alloc] initWithPeer:self.mPeerID securityIdentity:nil encryptionPreference:MCEncryptionRequired])) {
            [self.logger d:@"MCSession init failed"];
            return (self = nil);
        }
        self.mSession.delegate = self;
    }
    return (self);
}

- (int)startServiceAdvertiser {
    if (!(self.mServiceAdvertiser = [[MCNearbyServiceAdvertiser alloc] initWithPeer:self.mPeerID discoveryInfo:nil serviceType:BERTY_DRIVER_MC])) {
        [self.logger d:@"MCNearbyServiceAdvertiser init failed"];
        return (0);
    }
    self.mServiceAdvertiser.delegate = self;
    [self.mServiceAdvertiser startAdvertisingPeer];
    return (1);
}

- (int)startServiceBrowser {
    if (!(self.mServiceBrowser = [[MCNearbyServiceBrowser alloc] initWithPeer:self.mPeerID serviceType:BERTY_DRIVER_MC])) {
        [self.logger d:@"MCNearbyServiceBrowser init failed"];
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
        [self.logger d:@"sendToPeer error: %@: %@", description, reason];
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
            [self.logger d:@"Connecting: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
        break;
    case MCSessionStateConnected:
        [self.logger i:@"Connected: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
        BridgeHandleFoundPeer([peerID displayName]);
        break;
    case MCSessionStateNotConnected:
        [self.logger i:@"Not connected: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
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
    [self.logger d:@"didNotStartAdvertisingPeer: %@", error];
}

- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didReceiveInvitationFromPeer:(MCPeerID *)peerID withContext:(NSData *)context invitationHandler:(void (^)(BOOL, MCSession * _Nullable))invitationHandler {
    [self.logger d:@"didReceiveInvationFromPeer: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
    invitationHandler(true, self.mSession);
}

/*
                                MCNearbyServiceBrowserDelegate
 */

- (void)browser:(MCNearbyServiceBrowser *)browser lostPeer:(MCPeerID *)peerID {
    [self.logger d:@"lostPeer: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
}

- (void)browser:(MCNearbyServiceBrowser *)browser didNotStartBrowsingForPeers:(NSError *)error {
    [self.logger d:@"didNotStartBrowsingForPeers: %@", error];
}

- (void)browser:(MCNearbyServiceBrowser *)browser foundPeer:(MCPeerID *)peerID withDiscoveryInfo:(NSDictionary<NSString *,NSString *> *)info {
    [self.logger d:@"foundPeer: %@", [self.logger SensitiveNSObject:[peerID displayName]]];
    [browser invitePeer:peerID toSession:self.mSession withContext:nil timeout:10];
}

@end
