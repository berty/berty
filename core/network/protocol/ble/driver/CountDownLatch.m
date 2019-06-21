// +build darwin
//
//  CountDownLatch.m
//  ble
//
//  Created by sacha on 22/11/2018.
//  Copyright © 2018 berty. All rights reserved.
//

#import "CountDownLatch.h"

@implementation CountDownLatch

- (instancetype)init:(int)count {
    if (count < 0) {
        return nil;
    }

    [super self];

    self.count = count;
    self.semaphore = dispatch_semaphore_create(0);
    self.dispatch_queue = dispatch_queue_create("CountDownLatchQueue", DISPATCH_QUEUE_SERIAL);

    return self;
}

- (void)countDown {
    dispatch_async(self.dispatch_queue, ^{
        self.count--;
        if (self.count == 0) {
            dispatch_semaphore_signal(self.semaphore);
        }
    });
}

- (void)await {
    dispatch_semaphore_wait(self.semaphore, DISPATCH_TIME_FOREVER);
}

@end
