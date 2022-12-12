//go:build android
// +build android

package logger

/*
#cgo LDFLAGS: -llog
#include <android/log.h>
*/
import "C"

import "go.uber.org/zap/zapcore"

func NativeLog(logLevel zapcore.Level, namespace string, message string) {
	var level C.int = C.ANDROID_LOG_INFO

	switch logLevel {
	case zapcore.DebugLevel:
		level = C.ANDROID_LOG_DEBUG
	case zapcore.InfoLevel:
		level = C.ANDROID_LOG_INFO
	case zapcore.WarnLevel:
		level = C.ANDROID_LOG_WARN
	case zapcore.ErrorLevel:
		level = C.ANDROID_LOG_ERROR
	}

	C.__android_log_write(level, C.CString(namespace), C.CString(message))
}
