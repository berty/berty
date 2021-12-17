//
//  MCManager.h
//  driver
//
//  Created by Rémi BARBERO on 31/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MultipeerConnectivity/MultipeerConnectivity.h>

#import "Logger.h"

NS_ASSUME_NONNULL_BEGIN

@interface MCManager : NSObject <MCSessionDelegate, MCNearbyServiceAdvertiserDelegate, MCNearbyServiceBrowserDelegate>

@property (nonatomic, strong) MCSession *mSession;
@property (nonatomic, strong, nullable) MCNearbyServiceAdvertiser *mServiceAdvertiser;
@property (nonatomic, strong, nullable) MCNearbyServiceBrowser *mServiceBrowser;
@property (nonatomic, strong) MCPeerID *mPeerID;
@property (nonatomic, strong, nullable) Logger *logger;

- (MCPeerID *)getMCPeerID:(NSString *)peerID;
- (id)init:(NSString *)peerID useExternalLogger:(BOOL)useExternalLogger;
- (int)startServiceAdvertiser;
- (int)startServiceBrowser;
- (void)stopServiceAdvertiser;
- (void)stopServiceBrowser;
- (void)closeSessions;
- (int)sendToPeer:(NSString *)peerID data:(NSData *)data;
- (MCPeerID *)getPeer:(NSString *)peerID;

@end

NS_ASSUME_NONNULL_END
