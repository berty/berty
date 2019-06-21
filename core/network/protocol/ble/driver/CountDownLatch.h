//
//  CountDownLatch.h
//  ble
//
//  Created by sacha on 22/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import <Foundation/Foundation.h>

#ifndef CountDownLatch_h
#define CountDownLatch_h

@interface CountDownLatch : NSObject

@property (nonatomic, assign) int count;
@property (atomic, readwrite, strong) dispatch_semaphore_t semaphore;
@property (nonatomic, strong) dispatch_queue_t dispatch_queue;

- (instancetype)init:(int)count;
- (void)countDown;
- (void)await;

@end

#endif
