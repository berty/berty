//
//  BleQueue.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/05/2021.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#define MAX_TRIES 3

@interface BleQueue : NSObject

@property (nonatomic, strong, nonnull) dispatch_queue_t queue;
@property (nonatomic, strong, nonnull) NSMutableArray *tasks;
@property (readwrite) BOOL taskQueueBusy;
@property (readwrite) BOOL isRetrying;
@property (readwrite) int nbTries;
@property (readwrite) int index;

- (instancetype __nullable) init:(dispatch_queue_t)queue;
- (void) add:(void (^__nonnull)(void))block withCallback:(void (^__nullable)(NSError *))callback withDelay:(long)delay;
- (void) completedTask:(NSError *__nullable)error;
- (void) nextTask;
- (void) retryTask;
- (void) clear;

@end

NS_ASSUME_NONNULL_END
