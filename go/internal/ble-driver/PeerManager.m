// +build darwin
//
//  PeerManager.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 29/04/2021.
//

#import "PeerManager.h"

@implementation PeerManager

static NSMutableDictionary *connectedPeers = nil;

- (void)dealloc {
    [connectedPeers release];
    connectedPeers = nil;
    
    [super dealloc];
}

+ (NSMutableDictionary *__nonnull) connectedPeers {
    
    @synchronized (connectedPeers) {
        if (connectedPeers == nil) {
            connectedPeers = [[NSMutableDictionary alloc] init];
        }
        return connectedPeers;
    }
}

+ (void) addPeer:(ConnectedPeer *__nonnull) peer forPeerID:(NSString *__nonnull) peerID {
    @synchronized (connectedPeers) {
        [[PeerManager connectedPeers] setObject:peer forKey:peerID];
    }
}

+ (void) removePeer:(NSString *__nonnull) peerID {
    @synchronized (connectedPeers) {
            [[PeerManager connectedPeers] removeObjectForKey:peerID];
    }
}

+ (ConnectedPeer *__nullable) getPeer:(NSString *__nonnull) peerID {
    @synchronized (connectedPeers) {
            return [[PeerManager connectedPeers] objectForKey:peerID];
    }
}

+ (void) removeAllPeers {
    @synchronized (connectedPeers) {
            [[PeerManager connectedPeers] removeAllObjects];
    }
}

@end
