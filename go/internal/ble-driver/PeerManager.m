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

+ (NSMutableDictionary *__nonnull)connectedPeers {
    
    @synchronized (connectedPeers) {
        if (connectedPeers == nil) {
            connectedPeers = [[NSMutableDictionary alloc] init];
        }
        return connectedPeers;
    }
}

+ (ConnectedPeer *__nonnull)getPeer:(NSString *__nonnull) peerID {
    os_log_debug(OS_LOG_BLE, "getPeer called: peerID=%{public}@", peerID);
    
    ConnectedPeer *peer;
    
    @synchronized (connectedPeers) {
        if ((peer = [[PeerManager connectedPeers] objectForKey:peerID]) != nil) {
            os_log_debug(OS_LOG_BLE, "getPeer: peerID=%{public}@ already created", peerID);
            return peer;
        }
        
        os_log_debug(OS_LOG_BLE, "getPeer: peerID=%{public}@ created", peerID);
        peer = [[ConnectedPeer alloc] init];
        [[PeerManager connectedPeers] setObject:peer forKey:peerID];
        [peer release];
        return peer;
    }
}

+ (ConnectedPeer *__nullable)registerDevice:(BertyDevice *__nonnull)device withPeerID:(NSString *__nonnull)peerID isClient:(BOOL)isClient {
    os_log_debug(OS_LOG_BLE, "registerDevice called: identifier=%{public}@ peer=%{public}@ isClient=%d", [device getIdentifier], peerID, isClient);
    
    ConnectedPeer *peer;
    
    @synchronized (connectedPeers) {
        peer = [self getPeer:peerID];
        if (isClient) {
            peer.client = device;
        } else {
            peer.server = device;
        }
        
        device.peer = peer;
        
        peer.connected = TRUE;
        
        if (!BLEBridgeHandleFoundPeer(peerID)) {
            os_log_error(OS_LOG_BLE, "registerDevice failed: identifier=%{public}@ HandleFoundPeer failed: peer=%{public}@", [device getIdentifier], peerID);
            return NULL;
        }
        
        [device flushCache];
    }
    
    return peer;
}

+ (void)unregisterDevice:(BertyDevice *)device {
    os_log_debug(OS_LOG_BLE, "unregisterDevice called: identifier=%{public}@ peerID=%{public}@", [device getIdentifier], device.remotePeerID);
                 
    ConnectedPeer *peer;
    
    @synchronized (connectedPeers) {
        if ((peer = [[PeerManager connectedPeers] objectForKey:device.remotePeerID]) == nil) {
            os_log_error(OS_LOG_BLE, "unregisterDevice failed: peerID=%{public}@ not found", device.remotePeerID);
            return ;
        }
        
        if ([peer isConnected]) {
            os_log_debug(OS_LOG_BLE, "unregisterDevice: peerID=%{public}@: calling HandleLostPeer", device.remotePeerID);
            BLEBridgeHandleLostPeer(device.remotePeerID);
            peer.connected = FALSE;
        }
        
        [PeerManager removePeer:device.remotePeerID];
    }
}

+ (void)removePeer:(NSString *__nonnull) peerID {
    os_log_debug(OS_LOG_BLE, "removePeer called: peerID=%{public}@", peerID);
    
    @synchronized (connectedPeers) {
            [[PeerManager connectedPeers] removeObjectForKey:peerID];
    }
}

+ (void)removeAllPeers {
    os_log_debug(OS_LOG_BLE, "removeAllPeers called");
    
    @synchronized (connectedPeers) {
            [[PeerManager connectedPeers] removeAllObjects];
    }
}

@end
