// +build darwin
//
//  PeerManager.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 29/04/2021.
//

#import "PeerManager.h"
#import "BleInterface_darwin.h"

@implementation PeerManager

- (instancetype __nonnull)initWithLogger:(Logger *__nonnull)logger {
    self = [super init];
    
    if (self) {
        _logger = [logger retain];
        _connectedPeers = [[NSMutableDictionary alloc] init];
    }
    
    return self;
}

- (void)dealloc {
    [_connectedPeers release];
    [_logger release];
    
    [super dealloc];
}

- (ConnectedPeer *__nonnull)getPeer:(NSString *__nonnull) peerID {
    [self.logger d:@"getPeer called: peerID=%@", [self.logger SensitiveNSObject:peerID]];
    
    ConnectedPeer *peer;
    
    @synchronized (_connectedPeers) {
        if ((peer = [self.connectedPeers objectForKey:peerID]) != nil) {
            [self.logger d:@"getPeer: peerID=%@ alread created", [self.logger SensitiveNSObject:peerID]];
            return peer;
        }
        
        [self.logger d:@"getPeer: peerID=%@ created", [self.logger SensitiveNSObject:peerID]];
        peer = [[ConnectedPeer alloc] init];
        [self.connectedPeers setObject:peer forKey:peerID];
        [peer release];
        return peer;
    }
}

- (ConnectedPeer *__nullable)registerDevice:(BertyDevice *__nonnull)device withPeerID:(NSString *__nonnull)peerID isClient:(BOOL)isClient {
    [self.logger d:@"registerDevice called: identifier=%@ peer=%@ isClient=%d", [self.logger SensitiveNSObject:[device getIdentifier]], [self.logger SensitiveNSObject:peerID], isClient];
    
    ConnectedPeer *peer;
    
    @synchronized (_connectedPeers) {
        peer = [self getPeer:peerID];
        if (isClient) {
            peer.client = device;
        } else {
            peer.server = device;
        }
        
        device.peer = peer;
        
        peer.connected = TRUE;
        
        if (!BLEBridgeHandleFoundPeer(peerID)) {
            [self.logger e:@"registerDevice error: device=%@ peer=%@: HandleFoundPeer failed", [self.logger SensitiveNSObject:[device getIdentifier]], [self.logger SensitiveNSObject:peerID]];
            return NULL;
        }
        
        [device flushCache];
    }
    
    return peer;
}

- (void)unregisterDevice:(BertyDevice *)device {
    [self.logger d:@"unregisterDevice called: device=%@ peerID=%@", [self.logger SensitiveNSObject:[device getIdentifier]], [self.logger SensitiveNSObject:device.remotePeerID]];
                 
    ConnectedPeer *peer;
    
    @synchronized (_connectedPeers) {
        if ((peer = [self.connectedPeers objectForKey:device.remotePeerID]) == nil) {
            [self.logger e:@"unregisterDevice called: device=%@ peerID=%@: peerID not found", [self.logger SensitiveNSObject:[device getIdentifier]], [self.logger SensitiveNSObject:device.remotePeerID]];
            return ;
        }
        
        if ([peer isConnected]) {
            [self.logger d:@"unregisterDevice called: device=%{public}@ peerID=%{public}@: calling HandleLostPeer", [self.logger SensitiveNSObject:[device getIdentifier]], [self.logger SensitiveNSObject:device.remotePeerID]];
            BLEBridgeHandleLostPeer(device.remotePeerID);
            peer.connected = FALSE;
        }
        
        [self removePeer:device.remotePeerID];
    }
}

- (void)removePeer:(NSString *__nonnull) peerID {
    [self.logger d:@"removePeer called: peerID=%{public}@", [self.logger SensitiveNSObject:peerID]];
    
    @synchronized (_connectedPeers) {
            [self.connectedPeers removeObjectForKey:peerID];
    }
}

- (void)removeAllPeers {
    [self.logger d:@"removeAllPeers called"];
    
    @synchronized (_connectedPeers) {
            [self.connectedPeers removeAllObjects];
    }
}

@end
