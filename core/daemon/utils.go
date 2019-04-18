package daemon

import (
	"net"
	"regexp"

	"github.com/pkg/errors"
)

func getLocalIP() (string, error) {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return "", errors.Wrap(err, "can't get local IP")
	}

	localIP := conn.LocalAddr().(*net.UDPAddr).IP.String()
	conn.Close()

	localIPRegex := "(^127\\.)|(^10\\.)|(^172\\.1[6-9]\\.)|(^172\\.2[0-9]\\.)|(^172\\.3[0-1]\\.)|(^192\\.168\\.)"
	isLocal, err := regexp.MatchString(localIPRegex, localIP)
	if err != nil {
		return "", errors.Wrap(err, "can't get local IP")
	}

	if !isLocal {
		return "", errors.New("no local IP found (wifi probably disconnected)")
	}

	logger().Debug("local IP available")
	return localIP, nil
}
