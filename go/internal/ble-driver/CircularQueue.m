// +build darwin
//
//  CircularQueue.m
//
//  Created on 9/21/13.
//
//  https://gist.github.com/werediver/5345f91c897b8173e40e
//

#import "CircularQueue.h"


@interface CircularQueue () {
	NSMutableArray *_array;
	NSUInteger _start;
	unsigned long _mutationCounter;
}

@end


@implementation CircularQueue

- (id)initWithCapacity:(NSUInteger)capacity {
	self = [super init];
	if (self) {
		_capacity = capacity;
		_array = [[NSMutableArray alloc] initWithCapacity:_capacity];
		for (NSUInteger i = 0; i < _capacity; ++i) {
			[_array addObject:[NSNull null]];
		}
	}
	return self;
}

- (void)enqObject:(id)obj {
	const NSUInteger next = (_start + _count) % _capacity;
	[_array replaceObjectAtIndex:next withObject:obj];
	if (_count == _capacity) {
		// The queue was already full and the head is overwriten.
		_start = (_start + 1) % _capacity;
	} else {
		_count += 1;
	}
	_mutationCounter += 1;
}

- (id)deqObject {
	if (_count < 1)
		@throw [[NSException alloc] initWithName:NSRangeException reason:nil userInfo:nil];

	const id obj = [_array objectAtIndex:_start];
	[_array replaceObjectAtIndex:_start withObject:[NSNull null]];
	_start = (_start + 1) % _capacity;
	_count -= 1;
	_mutationCounter += 1;
	return obj;
}

- (id)objectAtIndex:(NSUInteger)index {
	if (index >= _capacity)
		@throw [[NSException alloc] initWithName:NSRangeException reason:nil userInfo:nil];
	return [_array objectAtIndex:(_start + index) % _capacity];
}

- (void)removeAllObjects {
	for (NSUInteger i = 0; i < _capacity; ++i) {
		[_array replaceObjectAtIndex:i withObject:[NSNull null]];
	}
	_start = _count = 0;
	_mutationCounter += 1;
}

#pragma mark - <NSFastEnumeration>

- (NSUInteger)countByEnumeratingWithState:(NSFastEnumerationState *)state objects:(id __unsafe_unretained [])buffer count:(NSUInteger)len {
	if (state->state == 0) {
		state->mutationsPtr = &_mutationCounter;
	}
	NSUInteger subcount = 0;
	if (state->state < _count) {
		state->itemsPtr = buffer;
		while (state->state < _count && subcount < len) {
			buffer[subcount] = [self objectAtIndex:state->state];
			state->state += 1;
			subcount     += 1;
		}
	}
	return subcount;
}

@end
