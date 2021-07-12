//
//  TaskDelay.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/05/2021.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface TaskDelay : NSObject

@property (nonatomic, copy) void (^block)(void);
@property (nonatomic, copy) void (^callback)(NSError *);
@property (nonatomic, assign) long delay;
@property (nonatomic, assign) int index;

- (instancetype __nullable) initWithBlock:(void (^ __nonnull)(void))block withCallback:(void (^__nullable)(NSError *))callback withDelay:(long)delay withIndex:(int)index;

@end

NS_ASSUME_NONNULL_END
