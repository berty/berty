#import <Foundation/Foundation.h>

bool generateKeyPairWithinEnclave(const char *goKeyId);
bool generateKeyPairWithoutEnclave(const char *goKeyId, int type);
bool deleteKeyPairFromKeychain(const char *goKeyId);
