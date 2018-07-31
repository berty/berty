package config

import (
	host "github.com/libp2p/go-libp2p-host"
	transport "github.com/libp2p/go-libp2p-transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
)

// TptC is the type for libp2p transport constructors. You probably won't ever
// implement this function interface directly. Instead, pass your transport
// constructor to TransportConstructor.
type TptC func(h host.Host, u *tptu.Upgrader) (transport.Transport, error)

var transportArgTypes = argTypes

// TransportConstructor uses reflection to turn a function that constructs a
// transport into a TptC.
//
// You can pass either a constructed transport (something that implements
// `transport.Transport`) or a function that takes any of:
//
// * The local peer ID.
// * A transport connection upgrader.
// * A private key.
// * A public key.
// * A Host.
// * A Network.
// * A Peerstore.
// * An address filter.
// * A security transport.
// * A stream multiplexer transport.
// * A private network protector.
//
// And returns a type implementing transport.Transport and, optionally, an error
// (as the second argument).
func TransportConstructor(tpt interface{}) (TptC, error) {
	// Already constructed?
	if t, ok := tpt.(transport.Transport); ok {
		return func(_ host.Host, _ *tptu.Upgrader) (transport.Transport, error) {
			return t, nil
		}, nil
	}
	ctor, err := makeConstructor(tpt, transportType, transportArgTypes)
	if err != nil {
		return nil, err
	}
	return func(h host.Host, u *tptu.Upgrader) (transport.Transport, error) {
		t, err := ctor(h, u)
		if err != nil {
			return nil, err
		}
		return t.(transport.Transport), nil
	}, nil
}

func makeTransports(h host.Host, u *tptu.Upgrader, tpts []TptC) ([]transport.Transport, error) {
	transports := make([]transport.Transport, len(tpts))
	for i, tC := range tpts {
		t, err := tC(h, u)
		if err != nil {
			return nil, err
		}
		transports[i] = t
	}
	return transports, nil
}
