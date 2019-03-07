package config

import (
	host "github.com/libp2p/go-libp2p-host"
	transport "github.com/libp2p/go-libp2p-transport"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
	libp2p_config "github.com/libp2p/go-libp2p/config"
)

func makeTransports(h host.Host, u *tptu.Upgrader, tpts []libp2p_config.TptC) ([]transport.Transport, error) {
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
