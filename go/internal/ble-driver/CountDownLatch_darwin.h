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

@property (nonatomic, assign, readwrite) NSInteger count;
@property (atomic, strong, readwrite) dispatch_semaphore_t semaphore;
@property (nonatomic, strong) dispatch_queue_t dispatch_queue;
@property (readwrite) BOOL timeout;

- (instancetype)initCount:(NSInteger)count;
- (void)incrementCount;
- (void)countDown;
- (void)await;
- (void)await:(NSUInteger)timeout withCancelBlock:(void (^)(void))callback;

@end

#endif
