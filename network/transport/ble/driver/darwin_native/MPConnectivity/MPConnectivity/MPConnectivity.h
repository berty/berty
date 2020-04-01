//
//  MPConnectivity.h
//  MPConnectivity
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <Foundation/Foundation.h>

int StartBleDriver(char *peerId);
int StopBleDriver(void);
int SendToPeer(char *peerID, void *data, int length);
int DialPeer(char *peerID);
void CloseConnWithPeer(char *peerID);
int BridgeHandlePeerFound(NSString *peerID);
void BridgeReceiveFromPeer(NSString *peerID, NSData *payload);
