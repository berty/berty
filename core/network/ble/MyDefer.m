
#import "MyDefer.h"

@implementation MyDefer {
   @private void(^_deferBlock)();
}
+ (instancetype)block:(void (^)())block {
   MyDefer *_d = [MyDefer new];
   _d->_deferBlock = block ?: ^{};
   return _d;
}
- (void)dealloc {
	dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_HIGH, 0), ^{
   		_deferBlock();
    });
}
@end
