
#ifndef MyDefer_h
#define MyDefer_h

#import <Foundation/Foundation.h>

@interface MyDefer : NSObject
+ (instancetype)block:(void(^)())block;
@end

#endif
