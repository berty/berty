package ble

import (
	"bytes"
	"io"

	"go.uber.org/zap"
)

var yLogger *yamuxLogger = nil

type yamuxLogger struct {
	io.Writer
}

func getYamuxLogger() io.Writer {
	if yLogger == nil {
		yLogger = &yamuxLogger{}
	}
	return yLogger
}

func (y *yamuxLogger) Write(p []byte) (n int, err error) {
	if bytes.HasPrefix(p, []byte("[ERR]")) {
		logger().Error("BLE", zap.ByteString("yamux error", p))
	} else if bytes.HasPrefix(p, []byte("[WARN]")) {
		logger().Warn("BLE", zap.ByteString("yamux warning", p))
	} else {
		logger().Debug("BLE", zap.ByteString("yamux", p))
	}
	return len(p), nil
}
