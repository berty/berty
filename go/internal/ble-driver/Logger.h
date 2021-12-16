//
//  Logger.h
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 08/12/2021.
//

#import <Foundation/Foundation.h>
#import <os/log.h>

NS_ASSUME_NONNULL_BEGIN

#define SENSITIVE_MASK @"####"

// Log levels
typedef NS_ENUM(uint8_t, level) {
    Debug,
    Info,
    Warn,
    Error,
};

@interface Logger : NSObject

@property (nonatomic, strong, nonnull) os_log_t logger;
@property (readwrite) BOOL showSensitiveData;
@property (readwrite) BOOL useExternalLogger;

- (instancetype __nonnull)initLocalLoggerWithSubSystem:(const char *)subSystem andCategorie:(const char*)categorie showSensitiveData:(BOOL)showSensitiveData;
- (instancetype __nonnull)initWithExternalLoggerAndShowSensitiveData:(BOOL)showSensitiveData;
- (void)log:(enum level)level withFormat:(NSString *__nonnull)format withArgs:(va_list)args;
- (void)d:(NSString *__nonnull)format, ...;
- (void)i:(NSString *__nonnull)format, ...;
- (void)e:(NSString *__nonnull)format, ...;
- (BOOL)showSensitiveData;
- (BOOL)useExternalLogger;
- (NSString *__nonnull)SensitiveNSObject:(id __nonnull)data;
- (NSString *__nonnull)SensitiveString:(const char *)data;

@end

NS_ASSUME_NONNULL_END
