//
//  MPConnectivity.h
//  MPConnectivity
//
//  Created by Rémi BARBERO on 30/03/2020.
//  Copyright © 2020 Rémi BARBERO. All rights reserved.
//

#import <Foundation/Foundation.h>

int StartBleDriver(char *addr, char *peerId);
int StopBleDriver(void);
int SendToDevice(char *addr, void *data, int length);
int DialDevice(char *addr);
void CloseConnWithDevice(char *addr);
