//
//  CircularQueue.h
//
//  Created on 9/21/13.
//
//   https://gist.github.com/werediver/5345f91c897b8173e40e
//

#import <Foundation/Foundation.h>

# define DEFAULT_CAPACITY 8

@interface CircularQueue : NSObject

@property (nonatomic, strong, nonnull) NSMutableArray *data;
@property (nonatomic, assign, readwrite) NSInteger capacity;
@property (nonatomic, assign, readwrite) NSInteger writeSequence;
@property (nonatomic, assign, readwrite) NSInteger readSequence;

- (instancetype __nonnull)initWithCapacity:(NSUInteger)capacity;
- (void)offer:(id __nonnull)obj; // Enqueue
- (id __nonnull)poll; // Get object and unqueue
- (id __nonnull)element; // Get object
- (void)clean;

@end
