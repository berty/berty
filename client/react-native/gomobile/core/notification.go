package core

import (
	"encoding/base64"
	"encoding/json"
	"strings"
	"sync"

	"berty.tech/core/chunk"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/push"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var _ notification.Driver = (*MobileNotification)(nil)

type NativeNotificationDriver interface {
	Display(title, body, icon, sound, url string) error
	Register() error
	Unregister() error
	RefreshToken() error
}

type MobileNotification struct {
	Native                NativeNotificationDriver
	subscribers           []chan []byte
	subscribersMutex      sync.Mutex
	tokenSubscribers      []chan *notification.Token
	tokenSubscribersMutex sync.Mutex
}

func (n MobileNotification) New() *MobileNotification {
	m := &MobileNotification{
		subscribers:      []chan []byte{},
		tokenSubscribers: []chan *notification.Token{},
	}
	return m
}

func (n *MobileNotification) Receive(data string) {
	logger().Debug("receive push notification", zap.String("data", data))
	payload := push.Payload{}
	if err := json.Unmarshal([]byte(data), &payload); err != nil {
		logger().Error(errorcodes.ErrNodePushNotifSub.Wrap(err).Error())
		return
	}

	b64Chunk := payload.Chunk
	if b64Chunk == "" {
		logger().Error(errorcodes.ErrNotificationReceive.Wrap(errors.New("chunk is missing")).Error())
		return
	}

	bytesChunk, err := base64.StdEncoding.DecodeString(string(b64Chunk))
	if err != nil {
		logger().Error(errorcodes.ErrNotificationReceive.Wrap(err).Error())
		return
	}

	c := &chunk.Chunk{}
	if err := c.Unmarshal(bytesChunk); err != nil {
		logger().Error(errorcodes.ErrNotificationReceive.Wrap(err).Error())
		return
	}

	if err := chunk.Publish(c); err != nil {
		logger().Error(errorcodes.ErrNotificationReceive.Wrap(err).Error())
	}
}

func (n *MobileNotification) ReceiveAPNSToken(token []byte) {
	t := &notification.Token{Type: push.DevicePushType_APNS, Value: make([]byte, len(token))}
	copy(t.Value, token)
	n.ReceiveToken(t)
}

func (n *MobileNotification) ReceiveFCMToken(token []byte) {
	t := &notification.Token{Type: push.DevicePushType_FCM, Value: make([]byte, len(token))}
	copy(t.Value, token)
	n.ReceiveToken(t)
}

func (n *MobileNotification) ReceiveToken(token *notification.Token) {
	logger().Debug("mobile receive token",
		zap.String("type", token.Type.String()),
		zap.String("hash", token.Hash()),
	)
	n.tokenSubscribersMutex.Lock()
	for i := range n.subscribers {
		n.tokenSubscribers[i] <- token
	}
	n.tokenSubscribersMutex.Unlock()
}

func (n *MobileNotification) Subscribe() chan []byte {
	// let chunk manager send reconstructed data
	sub := chunk.Subscribe()
	n.subscribersMutex.Lock()
	n.subscribers = append(n.subscribers, sub)
	n.subscribersMutex.Unlock()
	return sub
}

func (n *MobileNotification) Unsubscribe(sub chan []byte) {
	n.subscribersMutex.Lock()
	for i := range n.subscribers {
		if sub == n.subscribers[i] {
			n.subscribers = append(n.subscribers[:i], n.subscribers[i+1:]...)
			chunk.Unsubscribe(sub)
		}
	}
	n.subscribersMutex.Unlock()
}

func (n *MobileNotification) SubscribeToken() chan *notification.Token {
	sub := make(chan *notification.Token, 1)
	n.tokenSubscribersMutex.Lock()
	n.tokenSubscribers = append(n.tokenSubscribers, sub)
	n.tokenSubscribersMutex.Unlock()
	return sub
}

func (n *MobileNotification) UnsubscribeToken(sub chan *notification.Token) {
	n.tokenSubscribersMutex.Lock()
	for i := range n.tokenSubscribers {
		if sub == n.tokenSubscribers[i] {
			n.tokenSubscribers = append(n.tokenSubscribers[:i], n.tokenSubscribers[i+1:]...)
			break
		}
	}
	n.tokenSubscribersMutex.Unlock()
	close(sub)
}

//
// Native
//
func (n *MobileNotification) Display(p *notification.Payload) error {
	// don't display notification if user already on current route or parent
	currentRoute := app.GetRoute()
	// logger().Debug("display notification",
	// 	zap.String("state", deviceinfo.Application_State_name[int32(app.GetState())]),
	// 	zap.String("currentRoute", currentRoute),
	// 	zap.String("deepLink", p.DeepLink),
	// )
	if app.GetState() == deviceinfo.Application_Foreground && currentRoute != "" && p.DeepLink != "" {
		if currentRoute == p.DeepLink {
			return nil
		}
		routeSplit := strings.Split(currentRoute, "/")
		dplkSplit := strings.Split(p.DeepLink, "/")
		if routeSplit[0] == dplkSplit[0] {
			return nil
		}
	}
	return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
}

func (n *MobileNotification) Register() error {
	return n.Native.Register()
}

func (n *MobileNotification) Unregister() error {
	return n.Native.Unregister()
}

func (n *MobileNotification) RefreshToken() error {
	return n.Native.RefreshToken()
}
