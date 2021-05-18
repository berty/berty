package logutil

import (
	"net"
	"strings"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type TyberLogger struct {
	host string
	conn net.Conn
}

func NewTyberLogger(host string) (*TyberLogger, error) {
	// FIXME: support optional flags
	//         --tyber-host=1.2.3.4:4242,ignore-connection-refused
	//         --tyber-host=1.2.3.4:4242,no-reconnect
	host = strings.TrimSpace(host)
	if !strings.Contains(host, ":") {
		host += ":4242"
	}
	logger := TyberLogger{host: host}
	var err error
	logger.conn, err = net.Dial("tcp", host)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	return &logger, nil
}

func (l *TyberLogger) Write(input []byte) (int, error) {
	// FIXME: support reconnection
	return l.conn.Write(input)
}

func (l *TyberLogger) Close() error {
	return l.conn.Close()
}
