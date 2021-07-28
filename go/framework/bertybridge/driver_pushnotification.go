package bertybridge

import (
	"encoding/hex"

	"go.uber.org/zap"
)

type PushNotificationDriver interface {
	RequestToken(rtc RequestTokenCallback)
}

type RequestTokenCallback interface {
	OnSuccess(token []byte)
	OnFailure(err error)
}

var _ RequestTokenCallback = (*requestTokenCallback)(nil)

type requestTokenCallback struct {
	logger *zap.Logger
}

func (rtc *requestTokenCallback) OnSuccess(token []byte) {
	rtc.logger.Info("Token Request Succeeded", zap.String("token", hex.EncodeToString(token)))
}

func (rtc *requestTokenCallback) OnFailure(err error) {
	rtc.logger.Error("Token Request Failed", zap.Error(err))
}

// noopPushNotificationDriver is PushNotificationDriver
var _ PushNotificationDriver = (*noopPushNotificationDriver)(nil)

type noopPushNotificationDriver struct{}

func (*noopPushNotificationDriver) RequestToken(_ RequestTokenCallback) {}
