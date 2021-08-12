//
//  WriteDataCache.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 03/08/2021.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@class BertyDevice;

@interface WriteDataCache : NSObject

@property (nonatomic, strong, nonnull) BertyDevice *device;
@property (nonatomic, strong, nonnull) NSData *data;

- (instancetype __nonnull) initWithDevice:(BertyDevice *__nonnull)device withData:(NSData *__nonnull)data;

@end

NS_ASSUME_NONNULL_END
