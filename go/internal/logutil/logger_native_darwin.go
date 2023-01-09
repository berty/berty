//go:build darwin
// +build darwin

package logutil

/*
#import <os/log.h>

const int DEBUG = 0;
const int INFO = 1;
const int WARN = 2;
const int ERROR = 3;

void os_log_wrapper(int level, os_log_t log, char *s) {
	switch (level) {
		case DEBUG:
			os_log_debug(log, "%{public}s", s);
			break ;
		case WARN:
			os_log_error(log, "%{public}s", s);
			break ;
		case ERROR:
			os_log_fault(log, "%{public}s", s);
			break ;
		default:
			os_log_info(log, "%{public}s", s);
	}
}
*/
import "C"

import (
	"fmt"

	"go.uber.org/zap/zapcore"
)

func NativeLog(logLevel zapcore.Level, namespace string, message string) {
	var level C.int = C.INFO

	switch logLevel {
	case zapcore.DebugLevel:
		level = C.DEBUG
	case zapcore.WarnLevel:
		level = C.WARN
	case zapcore.ErrorLevel:
		level = C.ERROR
	default:
		level = C.INFO
	}

	log := C.os_log_create(C.CString(namespace), C.CString(""))

	C.os_log_wrapper(level, log, C.CString(fmt.Sprintf("[%s] %s", logLevel.CapitalString(), message)))
}
