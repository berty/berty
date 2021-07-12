// +build darwin
//
//  ConnectedPeer.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 29/04/2021.
//

#import "ConnectedPeer.h"

@implementation ConnectedPeer

- (BOOL) isReady {
        return [self isClientReady] && [self isServerReady];
}

@end
