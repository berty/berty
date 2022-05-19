package logging

import (
	"fmt"
	"math"
	"os"
	"runtime"
	"strings"
	"time"

	mlogger "github.com/gruntwork-io/terratest/modules/logger"
	"github.com/gruntwork-io/terratest/modules/testing"
	log "github.com/sirupsen/logrus"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	callDepth = 3
)

// func init() {
// 	dirname, err := os.UserHomeDir()
// 	if err != nil {
// 		panic(err)
// 	}

// 	_, err = os.Stat(fmt.Sprintf("%s/logs", dirname))
// 	if os.IsNotExist(err) {
// 		err = os.MkdirAll(fmt.Sprintf("%s/logs", dirname), 0755)
// 		if err != nil {
// 			panic(err)
// 		}
// 	}

// 	logFile, err := os.OpenFile(fmt.Sprintf("%s/logs/berty-infra-server.log", dirname), os.O_CREATE|os.O_APPEND|os.O_RDWR, 0755)
// 	if err != nil {
// 		panic(err)
// 	}

// 	mw := io.MultiWriter(os.Stdout, logFile)
// 	// log.SetOutput(mw)
// }

type zapTestLogger struct {
	l *zap.Logger
}

func (z *zapTestLogger) Logf(t testing.TestingT, format string, args ...interface{}) {
	z.l.Sugar().Infof(format, args...)
}

func TerraformLogger(logger *zap.Logger) *mlogger.Logger {
	return mlogger.New(&zapTestLogger{logger})
}

func callerPrefix(callDepth int) string {
	_, file, line, ok := runtime.Caller(callDepth)
	if ok {
		// Truncate file name at last file name separator.
		if index := strings.LastIndex(file, "/"); index >= 0 {
			file = file[index+1:]
		} else if index = strings.LastIndex(file, "\\"); index >= 0 {
			file = file[index+1:]
		}
	} else {
		file = "???"
		line = 1
	}

	return fmt.Sprintf("%s:%d", file, line)
}

func Log(i interface{}) {
	actualLog(fmt.Sprint(i))
}

func LogErr(err error) error {
	if err != nil {
		actualLog(err.Error())
		return err
	}

	return nil
}

func actualLog(s string) {
	prefix := pad(callerPrefix(callDepth))
	log.Info(fmt.Sprintf("%v - %v", prefix, s))
}

func pad(s string) string {
	remainder := int(math.Sqrt(math.Pow(float64(20-len(s)), float64(2))))
	for i := 0; i < remainder; i += 1 {
		s += " "
	}

	return s
}

func New(level zapcore.Level) *zap.Logger {
	encodeConfig := zap.NewDevelopmentEncoderConfig()
	encodeConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	encodeConfig.EncodeTime = zapcore.TimeEncoderOfLayout(time.Stamp)
	consoleEncoder := zapcore.NewConsoleEncoder(encodeConfig)
	consoleDebugging := zapcore.Lock(os.Stdout)
	core := zapcore.NewCore(consoleEncoder, consoleDebugging, level)
	logger := zap.New(core)

	logger.Debug("logger initialised")
	return logger
}
