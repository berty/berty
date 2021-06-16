// +build darwin
//
//  TaskDelay.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/05/2021.
//

#import "TaskDelay.h"

@implementation TaskDelay

- (instancetype __nullable) initWithBlock:(void (^ __nonnull)(void))block withCallback:(void (^__nullable)(NSError *))callback withDelay:(long)delay withIndex:(int)index {
    self = [super init];

    if (self) {
        _block = [block copy];
        _callback = [callback copy];
        _delay = delay;
        _index = index;
    }
    
    return self;
}

- (void)dealloc {
    [_block release];
    [_callback release];
    [super dealloc];
}

@end
