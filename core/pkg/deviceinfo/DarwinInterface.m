// +build darwin

#import "DarwinInterface.h"

char* getPackageId() {
    NSBundle *bundle = [NSBundle mainBundle];
    NSString* bundleId;

    if (bundle == nil) {
      bundleId = @"noBundle";
    } else {
      bundleId = [bundle objectForInfoDictionaryKey:@"CFBundleIdentifier"] ?: @"";
    }

    return [bundleId UTF8String];
}
