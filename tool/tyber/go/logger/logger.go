package logger

import (
	"fmt"
	"log"
)

const jsPrefix = "From Go:"

type Logger struct {
	name     string
	goLogger *log.Logger
	jsLogger JsLogger
}

type Log struct {
	Level   Level  `json:"level"`
	Message string `json:"message"`
}

type Level string

const (
	DebugLevel   Level = "debug"
	WarningLevel Level = "warning"
	InfoLevel    Level = "info"
	ErrorLevel   Level = "error"
)

type JsLogger func(*Log)

func New(goLogger *log.Logger, jsLogger JsLogger) *Logger {
	return &Logger{
		goLogger: goLogger,
		jsLogger: jsLogger,
	}
}

func (l *Logger) Named(name string) *Logger {
	if name == "" {
		return l
	}

	newLogger := *l
	newLogger.name = name

	return &newLogger
}

// // This method only forward log to Go logger
func (l *Logger) Println(v ...interface{}) {
	l.goLogger.Println(v...)
}

// All methods below format and forward logs to both JS and Go loggers
func (l *Logger) Debug(log string) {
	l.log(DebugLevel, log, nil)
}

func (l *Logger) Debugf(log string, args ...interface{}) {
	l.log(DebugLevel, log, args)
}

func (l *Logger) Warn(log string) {
	l.log(WarningLevel, log, nil)
}

func (l *Logger) Warnf(log string, args ...interface{}) {
	l.log(WarningLevel, log, args)
}

func (l *Logger) Info(log string) {
	l.log(InfoLevel, log, nil)
}

func (l *Logger) Infof(log string, args ...interface{}) {
	l.log(InfoLevel, log, args)
}

func (l *Logger) Error(log string) {
	l.log(ErrorLevel, log, nil)
}

func (l *Logger) Errorf(log string, args ...interface{}) {
	l.log(ErrorLevel, log, args)
}

func (l *Logger) log(level Level, template string, args []interface{}) {
	msg := template
	if msg == "" && len(args) > 0 {
		msg = fmt.Sprint(args...)
	} else if msg != "" && len(args) > 0 {
		msg = fmt.Sprintf(template, args...)
	}

	if l.name != "" {
		msg = fmt.Sprintf("[%s] %s", l.name, msg)
	}

	l.goLogger.Println(msg)
	l.jsLogger(&Log{
		Level:   level,
		Message: fmt.Sprintf("%s %s", jsPrefix, msg),
	})
}
