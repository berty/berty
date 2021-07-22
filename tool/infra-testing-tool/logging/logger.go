package logging

import (
	"fmt"
	log "github.com/sirupsen/logrus"
	"io"
	"math"
	"os"
	"runtime"
	"strings"
)

const (
	callDepth = 3
)

func init() {
	logFile, err := os.OpenFile("/home/ec2-user/logs/infra-daemon.log", os.O_CREATE | os.O_APPEND | os.O_RDWR, 0666)
	if err != nil {
		panic(err)
	}
	mw := io.MultiWriter(os.Stdout, logFile)
	log.SetOutput(mw)
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

func LogErr(err error) error{
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
	remainder := int(math.Sqrt(math.Pow(float64(20 - len(s)), float64(2))))
	for i:=0; i<remainder; i+=1 {
		s += " "
	}

	return s
}
