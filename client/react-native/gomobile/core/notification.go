package core

import (
	"fmt"
	"sync"

	"berty.tech/core/api/p2p"
	"berty.tech/core/pkg/notification"
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
	subscribers           []chan *notification.Payload
	subscribersMutex      sync.Mutex
	tokenSubscribers      []chan *notification.Token
	tokenSubscribersMutex sync.Mutex
}

func (n MobileNotification) New() *MobileNotification {
	return &MobileNotification{
		subscribers:      []chan *notification.Payload{},
		tokenSubscribers: []chan *notification.Token{},
	}
}

func (n *MobileNotification) Receive(data string) {
	logger().Debug(fmt.Sprintf("receive notification: %+v", data))
	n.subscribersMutex.Lock()
	for i := range n.subscribers {
		n.subscribers[i] <- &notification.Payload{
			Body: data,
		}
	}
	n.subscribersMutex.Unlock()
}

func (n *MobileNotification) ReceiveAPNSToken(token []byte) {
	n.ReceiveToken(&notification.Token{
		Value: token,
		Type:  p2p.DevicePushType_APNS,
	})
}

func (n *MobileNotification) ReceiveFCMToken(token []byte) {
	n.ReceiveToken(&notification.Token{
		Value: token,
		Type:  p2p.DevicePushType_FCM,
	})
}

func (n *MobileNotification) ReceiveToken(token *notification.Token) {
	logger().Debug("receive token",
		zap.String("type", token.Type.String()),
		zap.String("hash", token.Hash()),
	)
	n.tokenSubscribersMutex.Lock()
	for i := range n.subscribers {
		n.tokenSubscribers[i] <- token
	}
	n.tokenSubscribersMutex.Unlock()

}

func (n *MobileNotification) Subscribe() chan *notification.Payload {
	sub := make(chan *notification.Payload, 1)
	n.subscribersMutex.Lock()
	n.subscribers = append(n.subscribers, sub)
	n.subscribersMutex.Unlock()
	return sub
}

func (n *MobileNotification) Unsubscribe(sub chan *notification.Payload) {
	n.subscribersMutex.Lock()
	for i := range n.subscribers {
		if sub == n.subscribers[i] {
			n.subscribers = append(n.subscribers[:i], n.subscribers[i+1:]...)
		}
	}
	n.subscribersMutex.Unlock()
	close(sub)
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
		}
	}
	n.tokenSubscribersMutex.Unlock()
	close(sub)
}

//
// Native
//
func (n *MobileNotification) Display(p *notification.Payload) error {
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
