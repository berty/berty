// +build darwin
//
//  Logger.m
//  BertyBridgeDemo
//
//  Created by Rémi BARBERO on 08/12/2021.
//

#import <os/log.h>
#import "Logger.h"
#import "BleInterface_darwin.h"

@implementation Logger

- (instancetype __nonnull)initLocalLoggerWithSubSystem:(const char *)subSystem andCategorie:(const char*)categorie showSensitiveData:(BOOL)showSensitiveData {
    self = [super init];
    
    if (self) {
        _logger = os_log_create(subSystem, categorie);
        _useExternalLogger = FALSE;
        _showSensitiveData = showSensitiveData;
    }
    
    return self;
}

- (instancetype __nonnull)initWithExternalLoggerAndShowSensitiveData:(BOOL)showSensitiveData {
    self = [super init];
    
    if (self) {
        _logger = nil;
        _useExternalLogger = TRUE;
        _showSensitiveData = showSensitiveData;
    }
    
    return self;
}

- (void)log:(enum level)level withFormat:(NSString *__nonnull)format withArgs:(va_list)args {
    NSString *message = [[NSString alloc] initWithFormat:format arguments:args];
    
    if (self.useExternalLogger) {
        BLEBridgeLog(level, message);
    } else {
        if (self.logger == nil) {
            NSLog(@"log error: logger is not set");
        } else {
            uint8_t osLevel;
            switch (level) {
                case Debug:
                    osLevel = OS_LOG_TYPE_DEBUG;
                    break ;
                case Info:
                    osLevel = OS_LOG_TYPE_INFO;
                    break ;
                case Error:
                    osLevel = OS_LOG_TYPE_ERROR;
                    break ;
                default:
                    osLevel = OS_LOG_TYPE_DEFAULT;
                    break ;
            }
            
            os_log_with_type(self.logger, osLevel, "%@", message);
        }
    }
    
    [message release];
}

- (void)d:(NSString *__nonnull)format, ... {
    va_list args;
    va_start(args, format);
    [self log:Debug withFormat:format withArgs:args];
    va_end(args);
}

- (void)i:(NSString *__nonnull)format, ... {
    va_list args;
    va_start(args, format);
    [self log:Info withFormat:format withArgs:args];
    va_end(args);
}

- (void)e:(NSString *__nonnull)format, ... {
    va_list args;
    va_start(args, format);
    [self log:Error withFormat:format withArgs:args];
    va_end(args);
}

- (NSString *__nonnull)SensitiveNSObject:(id __nonnull)data {
    if (self.showSensitiveData) {
        return [NSString stringWithFormat:@"%@", data];
    } else {
        return SENSITIVE_MASK;
    }
}

- (NSString *__nonnull)SensitiveString:(const char *)data {
    if (data == nil) {
        return @"";
    }
    
    if (self.showSensitiveData) {
        return [NSString stringWithFormat:@"%s", data];
    } else {
        return SENSITIVE_MASK;
    }
}

@end
