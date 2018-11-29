package ble

import (
	"fmt"
)

func GoLogger(log string, level string, tag string) {
	if tag != "" {
		log = fmt.Sprintf("%s: %s", tag, log)
	}
	switch level {
	case "debug":
		logger().Debug(log)
	case "info":
		logger().Info(log)
	case "warn":
		logger().Warn(log)
	case "error":
		logger().Error(log)
	default:
		logger().Error(fmt.Sprintf("unknow level: <%s> for log: <%s>", level, log))
	}
}
