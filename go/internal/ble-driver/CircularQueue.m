// +build darwin

#import "CircularQueue.h"

@implementation CircularQueue

- (instancetype __nonnull)initWithCapacity:(NSUInteger)capacity {
	self = [super init];
    
	if (self) {
        _capacity = capacity < 1 ? DEFAULT_CAPACITY : capacity;
        _data = [[NSMutableArray alloc] initWithCapacity:_capacity];
        _writeSequence = -1;
        _readSequence = 0;

		for (NSUInteger i = 0; i < _capacity; ++i) {
			[_data addObject:[NSNull null]];
		}
	}
    
	return self;
}

- (void)dealloc {
    [_data release];
    
    [super dealloc];
}

- (void)offer:(id)obj {
    if ([self isNotFull]) {
        NSInteger nextWrite = (self.writeSequence + 1) % self.capacity;
        [self.data replaceObjectAtIndex:nextWrite withObject:obj];
        
        self.writeSequence++;
    } else {
        @throw [[[NSException alloc] initWithName:NSRangeException reason:nil userInfo:nil] autorelease];
    }
}

- (id)poll {
    if ([self isNotEmpty]) {
        NSInteger index = self.readSequence % self.capacity;
        id value = [[self.data objectAtIndex:index] retain];
        
        [self.data replaceObjectAtIndex:index withObject:[NSNull null]];
        self.readSequence++;
        
        return [value autorelease];
    }
    
    return [NSNull null];
}

- (id)element {
    if ([self isNotEmpty]) {
        NSInteger index = self.readSequence % self.capacity;
        return [self.data objectAtIndex:index];
    }
    
    return [NSNull null];
}

- (void)clean {
	for (NSUInteger i = 0; i < _capacity; ++i) {
		[self.data replaceObjectAtIndex:i withObject:[NSNull null]];
	}
	self.readSequence = 0;
    self.writeSequence = -1;
}

- (NSInteger)size {
    return (self.writeSequence - self.readSequence) + 1;
}

- (BOOL)isEmpty {
    return self.writeSequence < self.readSequence;
}

- (BOOL)isFull {
    return [self size] >= self.capacity;
}

- (BOOL)isNotEmpty {
    return ![self isEmpty];
}

- (BOOL)isNotFull {
    return ![self isFull];
}

@end
