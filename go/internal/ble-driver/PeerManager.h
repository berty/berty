//
//  PeerManager.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 29/04/2021.
//

#import <Foundation/Foundation.h>
#import "ConnectedPeer.h"

NS_ASSUME_NONNULL_BEGIN

@interface PeerManager : NSObject

+ (NSMutableDictionary *__nonnull)connectedPeers;
+ (ConnectedPeer *__nonnull)getPeer:(NSString *__nonnull) peerID;
+ (ConnectedPeer *__nullable)registerDevice:(BertyDevice *__nonnull)device withPeerID:(NSString *__nonnull)peerID isClient:(BOOL)isClient;
+ (void)unregisterDevice:(BertyDevice *)device;
+ (void)removePeer:(NSString *__nonnull) peerID;
+ (void)removeAllPeers;

@end

NS_ASSUME_NONNULL_END
