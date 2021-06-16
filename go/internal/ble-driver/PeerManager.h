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

+ (NSMutableDictionary *__nonnull) connectedPeers;
+ (void) addPeer:(ConnectedPeer *__nonnull) peer forPeerID:(NSString *__nonnull) peerID;
+ (void) removePeer:(NSString *__nonnull) peerID;
+ (void) removeAllPeers;
+ (ConnectedPeer *__nullable) getPeer:(NSString *__nonnull) peerID;

@end

NS_ASSUME_NONNULL_END
