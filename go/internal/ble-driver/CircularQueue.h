//
//  CircularQueue.h
//
//  Created on 9/21/13.
//
//   https://gist.github.com/werediver/5345f91c897b8173e40e
//

#import <Foundation/Foundation.h>


@interface CircularQueue : NSObject <NSFastEnumeration>

@property (nonatomic, assign, readonly) NSUInteger capacity;
@property (nonatomic, assign, readonly) NSUInteger count;

- (id)initWithCapacity:(NSUInteger)capacity;

- (void)enqObject:(id)obj; // Enqueue
- (id)deqObject;           // Dequeue

- (id)objectAtIndex:(NSUInteger)index;
- (void)removeAllObjects;

@end
