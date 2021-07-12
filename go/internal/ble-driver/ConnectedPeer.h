//
//  ConnectedPeer.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 29/04/2021.
//

#import <Foundation/Foundation.h>

#import "BertyDevice_darwin.h"

NS_ASSUME_NONNULL_BEGIN

@interface ConnectedPeer : NSObject

- (BOOL) isReady;

@property (nonatomic, assign, nullable) BertyDevice *client;
@property (nonatomic, assign, nullable) BertyDevice *server;
@property (readwrite, getter=isServerReady) BOOL serverReady;
@property (readwrite, getter=isClientReady) BOOL clientReady;
@property (readwrite, getter=isConnected) BOOL connected;
@property (strong, nullable) CBL2CAPChannel *channel;

@end

NS_ASSUME_NONNULL_END
