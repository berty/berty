// +build darwin
//
//  BleQueue.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/05/2021.
//

#import <os/log.h>

#import "BleQueue.h"
#import "TaskDelay.h"

@implementation BleQueue

- (instancetype __nullable) init:(dispatch_queue_t) queue {
    self = [super init];
    
    if (self) {
        _tasks = [[NSMutableArray alloc] init];
        _queue = [queue retain];
    }
    
    return self;
}

- (void)dealloc {
    [_tasks removeAllObjects];
    [_tasks release];
    [_queue release];

    [super dealloc];
}

- (void) add:(void (^__nonnull)(void))block withCallback:(void (^__nullable)(NSError *))callback withDelay:(long)delay {
    @synchronized (self.tasks) {
        TaskDelay *task = [[TaskDelay alloc] initWithBlock:block withCallback:callback withDelay:delay withIndex:(self.index++)];
        [self.tasks addObject:task]; // add to the end of the array
        NSLog(@"BleQueue: added task at index=%d count=%ld", task.index, [self.tasks count]);
        [self nextTask];
        [task release];
    }
}

- (void) completedTask:(NSError *__nullable)error {
    @synchronized (self.tasks) {
        TaskDelay *currentTask;
        
        if ([self.tasks count] == 0) {
            NSLog(@"BleQueue: completedTask error: no task running");
            return ;
        }
        
        currentTask = [self.tasks objectAtIndex:0];
        NSLog(@"BleQueue: completedTask at index=%d", currentTask.index);
        if (currentTask.callback != nil) {
            dispatch_async(self.queue, ^{
                currentTask.callback(error);
            });
        }
        
        self.isRetrying = FALSE;
        self.taskQueueBusy = FALSE;
        [self.tasks removeObjectAtIndex:0];
        [self nextTask];
    }
}

- (void) nextTask {
    @synchronized (self.tasks) {
        TaskDelay *nextTask;
        
        if (self.taskQueueBusy) {
            NSLog(@"BleQueue: nextTask: another task is running");
            return ;
        }
        
        if ([self.tasks count] == 0 ) {
            NSLog(@"BleQueue: nextTask error: no task queued: count=%ld", [self.tasks count]);
            return ;
        }
        
        nextTask = [self.tasks objectAtIndex:0];
        NSLog(@"BleQueue: nextTask at index=%d with delay=%ld", nextTask.index, nextTask.delay);
        
        self.taskQueueBusy = TRUE;
        if (!self.isRetrying) {
            self.nbTries = 0;
        }
        dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(nextTask.delay * NSEC_PER_SEC));
        dispatch_after(popTime, self.queue, nextTask.block);
    }
}

- (void) retryTask {
    @synchronized (self.tasks) {
        TaskDelay *currentTask;
        
        self.taskQueueBusy = FALSE;

        if ([self.tasks count] == 0) {
            NSLog(@"BleQueue: retryTask error: no task running");
        } else {
            currentTask = [self.tasks objectAtIndex:0];
            if (self.nbTries >= MAX_TRIES) {
                NSLog(@"BleQueue: max number of tries reached, not retrying operation anymore for task index=%d", currentTask.index);
                [self.tasks removeObjectAtIndex:0];
            } else {
                NSLog(@"BleQueue: retrying task at index=%d", currentTask.index);
                self.isRetrying = TRUE;
            }
        }
        
        [self nextTask];
    }
}

- (void) clear {
    @synchronized (self.tasks) {
        [self.tasks removeAllObjects];
        self.taskQueueBusy = FALSE;
    }
}

@end
