//
//  mc-driver.h
//  driver
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <os/log.h>

#import "Logger.h"

void StartMCDriver(char *localPId);
void StopMCDriver(void);
int SendToPeer(char *remotePID, void *payload, int length);
int DialPeer(char *remotePID);
void CloseConnWithPeer(char *remotePID);
int BridgeHandleFoundPeer(NSString *remotePID);
void BridgeHandleLostPeer(NSString *remotePID);
void BridgeReceiveFromPeer(NSString *remotePID, NSData *payload);
void MCBridgeLog(enum level level, NSString *message);
void MCUseExternalLogger(void);
