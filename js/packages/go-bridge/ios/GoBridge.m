#import "React/RCTBridge.h"

// TEMPORARY FIX UNTIL https://github.com/facebook/react-native/pull/24155 is merged in react-native

#define RCT_EXPORT_MODULE_NO_LOAD(js_name, objc_name)                   \
 RCT_EXTERN void RCTRegisterModule(Class);                              \
+ (NSString *)moduleName { return @#js_name; }                          \
 __attribute__((constructor))                                           \
 static void RCT_CONCAT(initialize_, objc_name)() { RCTRegisterModule([objc_name class]); }

#define RCT_EXTERN_REMAP_MODULE_2(js_name, objc_name, objc_supername) \
 objc_name : objc_supername                                           \
 @end                                                                 \
 @interface objc_name (RCTExternModule) <RCTBridgeModule>             \
 @end                                                                 \
 @implementation objc_name (RCTExternModule)                          \
 RCT_EXPORT_MODULE_NO_LOAD(js_name, objc_name)

@interface RCT_EXTERN_REMAP_MODULE_2(GoBridge, GoBridge, NSObject)

RCT_EXTERN_METHOD(startDemo:(NSDictionary)opts
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getDemoAddr:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);


RCT_EXTERN_METHOD(startProtocol:(NSDictionary)opts
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

RCT_EXTERN_METHOD(getProtocolAddr:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
