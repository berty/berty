// +build darwin
//
//  WriteDataCache.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/08/2021.
//

#import "WriteDataCache.h"
#import "BertyDevice_darwin.h"

@implementation WriteDataCache

- (instancetype __nonnull) initWithDevice:(BertyDevice *__nonnull)device withData:(NSData *__nonnull)data {
    self = [super init];
    
    if (self) {
        _device = [device retain];
        _data = [data retain];
    }
    
    return self;
}

- (void)dealloc {
    [_device release];
    [_data release];
    
    [super dealloc];
}

@end
