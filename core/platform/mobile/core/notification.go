package core

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	netURL "net/url"
	"regexp"
	"strings"
	"sync"

	"berty.tech/core/chunk"
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
	subscribers           []<-chan []byte
	subscribersMutex      sync.Mutex
	tokenSubscribers      []chan *notification.Token
	tokenSubscribersMutex sync.Mutex
}

func NewMobileNotification() *MobileNotification {
	return &MobileNotification{
		subscribers:      []<-chan []byte{},
		tokenSubscribers: []chan *notification.Token{},
	}
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

func (n *MobileNotification) Subscribe() <-chan []byte {
	// let chunk manager send reconstructed data
	sub := chunk.Subscribe()
	n.subscribersMutex.Lock()
	n.subscribers = append(n.subscribers, sub)
	n.subscribersMutex.Unlock()
	return sub
}

func (n *MobileNotification) Unsubscribe(sub <-chan []byte) {
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
	state := GetAppState()
	route := "berty://berty.chat/" + GetAppRoute()

	logger().Debug("display notification",
		zap.String("state", state),
		zap.String("currentRoute", route),
		zap.String("deepLink", p.DeepLink),
	)

	// force display in this state
	if p.DeepLink == "" || state != DeviceInfoAppStateForeground {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}

	// parse route and deep link
	url, err := netURL.Parse(route)
	if err != nil {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}
	dlURL, err := netURL.Parse(p.DeepLink)
	if err != nil {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}

	logger().Debug("display notification",
		zap.String("url fragment", fmt.Sprintf("%+v", url.Fragment)),
		zap.String("dlURL fragment", fmt.Sprintf("%+v", dlURL.Fragment)),
	)

	logger().Debug("display notification",
		zap.String("url path", url.Path),
		zap.String("dlURL path", dlURL.Path),
	)

	// check if deep link path is child to route path
	parentMatch, _ := regexp.MatchString(url.Path+"/.+", dlURL.Path)
	if parentMatch {
		return nil
	}

	// check if route path is equal to deeplink path
	if url.Path != dlURL.Path {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}

	// check if route fragment id is equal to deeplink fragment id
	frag := strings.Split(url.Fragment, ",")
	dlFrag := strings.Split(dlURL.Fragment, ",")

	params := map[string]string{}
	dlParams := map[string]string{}

	for _, param := range frag {
		keyVal := strings.Split(param, "=")
		if len(keyVal) == 2 {
			params[keyVal[0]] = keyVal[1]
		}
	}
	for _, param := range dlFrag {
		keyVal := strings.Split(param, "=")
		if len(keyVal) == 2 {
			dlParams[keyVal[0]] = keyVal[1]
		}
	}

	id, ok := params["id"]
	dlID, dlOK := dlParams["id"]
	// if one of two as no id
	if !ok || !dlOK {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}

	// if ids are not equals
	if id != dlID {
		return n.Native.Display(p.Title, p.Body, p.Icon, p.Sound, p.DeepLink)
	}

	return nil
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
