package core

import (
	"encoding/json"
	"fmt"
	"net"
	"regexp"

	account "berty.tech/core/manager/account"
	"github.com/pkg/errors"
)

var (
	localListener     *net.Listener
	chanStopLocalGRPC chan struct{}
)

type localGRPCInfos struct {
	IsRunning bool
	LocalAddr string
}

func getLocalIP() (string, error) {
	defer panicHandler()
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

func GetLocalGRPCInfos() string {
	defer panicHandler()
	localAddr, err := getLocalIP()
	if err == nil {
		localAddr = fmt.Sprintf("%s:%d", localAddr, defaultLocalGRPCPort)
	}

	infos := &localGRPCInfos{
		IsRunning: localListener != nil,
		LocalAddr: localAddr,
	}

	infosJSON, err := json.Marshal(infos)
	if err != nil {
		logger().Error(err.Error())
		panic(err)
	}

	return string(infosJSON)
}

func StartLocalGRPC() error {
	defer panicHandler()
	waitDaemon(accountName)
	currentAccount, _ := account.Get(rootContext, accountName)

	if localListener != nil {
		return errors.New("local gRPC is already running")
	}

	localIP, err := getLocalIP()
	if err != nil {
		return errors.Wrap(err, "start local gRPC failed")
	}

	listener, err := net.Listen("tcp", fmt.Sprintf("%s:%d", localIP, defaultLocalGRPCPort))
	if err != nil {
		return errors.Wrap(err, "start local gRPC failed")
	}

	localListener = &listener
	appConfig.LocalGRPC = true
	appConfig.StartCounter++
	if err := appConfig.Save(); err != nil {
		return errors.Wrap(err, "state DB save failed")
	}
	logger().Debug("local gRPC listener started")

	go func() {
		defer panicHandler()
		err := currentAccount.GrpcServer.Serve(*localListener)
		logger().Debug("local gRPC listener stopped")
		localListener = nil
		if err != nil {
			logger().Error(err.Error())
		}
	}()

	return nil
}

func StopLocalGRPC() error {
	defer panicHandler()

	if localListener == nil {
		return errors.New("local gRPC is already stopped")
	}

	if err := (*localListener).Close(); err != nil {
		return errors.Wrap(err, "stop local gRPC failed")
	}

	localListener = nil
	appConfig.LocalGRPC = false
	appConfig.StartCounter++
	if err := appConfig.Save(); err != nil {
		return errors.Wrap(err, "state DB save failed")
	}

	return nil
}
