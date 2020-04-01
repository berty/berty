//
//  MPConnectivityManager.m
//  MPConnectivity
//
//  Created by Rémi BARBERO on 31/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <MultipeerConnectivity/MultipeerConnectivity.h>
#import "MPConnectivityManager.h"
#import "MPConnectivity.h"

static MCPeerID *gPeerID = nil;
NSString *BERTY_DRIVER_MC = @"berty-mc";

@implementation MPConnectivityManager

- (id)init:(NSString *)peerID {
    if (self = [super init]) {
        gPeerID = [[MCPeerID alloc] initWithDisplayName:peerID];
        if (!(self.mSession = [[MCSession alloc] initWithPeer:gPeerID securityIdentity:nil encryptionPreference:MCEncryptionRequired])) {
            NSLog(@"MCSession init failed");
            return (self = nil);
        }
        self.mSession.delegate = self;
    }
    return (self);
}

- (int)startServiceAdvertiser {
    NSLog(@"startServiceAdvertiser called, peerID: %@, serviceType: %@", gPeerID, BERTY_DRIVER_MC);
    if (!(self.mServiceAdvertiser = [[MCNearbyServiceAdvertiser alloc] initWithPeer:gPeerID discoveryInfo:nil serviceType:BERTY_DRIVER_MC])) {
        NSLog(@"MCNearbyServiceAdvertiser init failed");
        return (0);
    }
    self.mServiceAdvertiser.delegate = self;
    [self.mServiceAdvertiser startAdvertisingPeer];
    return (1);
}

- (int)startServiceBrowser {
    NSLog(@"startServiceBrowser called");
    if (!(self.mServiceBrowser = [[MCNearbyServiceBrowser alloc] initWithPeer:gPeerID serviceType:BERTY_DRIVER_MC])) {
        NSLog(@"MCNearbyServiceBrowser init failed");
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
       [self.mSession sendData:data toPeers:array withMode:MCSessionSendDataReliable error:&error];
    }
    return (1);
}

- (MCPeerID *)getPeer:(NSString *)peerID {
    NSLog(@"getPeer called");
    NSArray<MCPeerID *> *peers = [self.mSession connectedPeers];
    for (MCPeerID *peer in peers) {
        if ([[peer displayName] isEqualToString:peerID]) {
            NSLog(@"peer: %@, peerID: %@", [peer displayName], peerID);
            NSLog(@"getPeer found");
            return (peer);
        }
    }
    NSLog(@"getPeer not found");
    return (nil);
}

/*
                                MCSessionDelegate
 */

- (void)session:(MCSession *)session peer:(MCPeerID *)peerID didChangeState:(MCSessionState)state{
    switch (state) {
    case MCSessionStateConnecting:
            NSLog(@"Connecting: %@", [peerID displayName]);
        break;
    case MCSessionStateConnected:
        NSLog(@"Connected: %@", [peerID displayName]);
        BridgeHandlePeerFound([peerID displayName]);
        break;
    case MCSessionStateNotConnected:
        NSLog(@"Not connected: %@", [peerID displayName]);
        break;
    }
}
 
- (void)session:(MCSession *)session didReceiveData:(NSData *)data fromPeer:(MCPeerID *)peerID{
    NSLog(@"didReceiveData from peerID: %@", [peerID displayName]);
    BridgeReceiveFromPeer([peerID displayName], data);
}
 
 
- (void)session:(MCSession *)session didStartReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID withProgress:(NSProgress *)progress{
    
}
 
 
- (void)session:(MCSession *)session didFinishReceivingResourceWithName:(NSString *)resourceName fromPeer:(MCPeerID *)peerID atURL:(NSURL *)localURL withError:(NSError *)error{
    
}
 
 
- (void)session:(MCSession *)session didReceiveStream:(NSInputStream *)stream withName:(NSString *)streamName fromPeer:(MCPeerID *)peerID{
    
}

- (void)session:(MCSession *)session didReceiveCertificate:(NSArray *)certificate fromPeer:(MCPeerID *)peerID certificateHandler:(void (^)(BOOL accept))certificateHandler
{
     if (certificateHandler != nil)
     {
         certificateHandler(YES);
     }
}

/*
                                MCNearbyServiceAdvertiserDelegate
 */

- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didNotStartAdvertisingPeer:(NSError *)error {
    NSLog(@"didNotStartAdvertisingPeer: %@", error);
}

- (void)advertiser:(MCNearbyServiceAdvertiser *)advertiser didReceiveInvitationFromPeer:(MCPeerID *)peerID withContext:(NSData *)context invitationHandler:(void (^)(BOOL, MCSession * _Nullable))invitationHandler {
    NSLog(@"didReceiveInvationFromPeer: %@", [peerID displayName]);
    invitationHandler(true, self.mSession);
}

/*
                                MCNearbyServiceBrowserDelegate
 */

- (void)browser:(MCNearbyServiceBrowser *)browser lostPeer:(MCPeerID *)peerID {
    NSLog(@"lostPeer: %@", [peerID displayName]);
}

- (void)browser:(MCNearbyServiceBrowser *)browser didNotStartBrowsingForPeers:(NSError *)error {
    NSLog(@"didNotStartBrowsingForPeers: %@", error);
}

- (void)browser:(MCNearbyServiceBrowser *)browser foundPeer:(MCPeerID *)peerID withDiscoveryInfo:(NSDictionary<NSString *,NSString *> *)info {
    NSLog(@"foundPeer: %@", [peerID displayName]);
    [browser invitePeer:peerID toSession:self.mSession withContext:nil timeout:10];
}

@end
