package core

import (
	"errors"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	account "berty.tech/core/manager/account"
	reuse "github.com/libp2p/go-reuseport"
	"go.uber.org/zap"
)

func logger() *zap.Logger {
	return zap.L().Named("client.rn.gomobile")
}

var accountName = "new-berty-user"

func panicHandler() {
	if r := recover(); r != nil {
		logger().Error(fmt.Sprintf("%+v", r))
	}
}

func getRandomPort() (int, error) {
	listener, err := reuse.Listen("tcp", "0.0.0.0:0")
	if err != nil {
		return 0, err
	}
	port := listener.Addr().(*net.TCPAddr).Port
	return port, nil
}

func GetPort() (int, error) {

	defer panicHandler()

	a, err := account.Get(accountName)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(strings.Split(a.GQLBind, ":")[1])
}

func Start(datastorePath string, loggerNative Logger) error {

	defer panicHandler()

	if err := setupLogger("debug", loggerNative); err != nil {
		return err
	}
	a, _ := account.Get(accountName)
	if a != nil {
		return errors.New("daemon already started")
	}
	run(datastorePath, loggerNative)
	waitDaemon()
	return nil
}

func Restart(datastorePath string) error {

	defer panicHandler()

	currentAccount, _ := account.Get(accountName)
	if currentAccount != nil {
		currentAccount.ErrChan() <- nil
	}

	waitDaemon()
	return nil
}

func DropDatabase(datastorePath string) error {

	defer panicHandler()

	currentAccount, err := account.Get(accountName)
	if err != nil {
		return err
	}
	err = currentAccount.DropDatabase()
	if err != nil {
		return err
	}
	return Restart(datastorePath)
}

func run(datastorePath string, loggerNative Logger) {
	go func() {
		for {
			err := daemon(datastorePath, loggerNative)
			if err != nil {
				logger().Error("handle error, try to restart", zap.Error(err))
				time.Sleep(time.Second)
			} else {
				logger().Info("restarting daemon")
			}
		}
	}()
}

func waitDaemon() {
	currentAccount, _ := account.Get(accountName)
	if currentAccount == nil || currentAccount.GQLBind == "" {
		logger().Debug("waiting for daemon to start")
		time.Sleep(time.Second)
		waitDaemon()
	}
}

func daemon(datastorePath string, loggerNative Logger) error {

	defer panicHandler()

	grpcPort, err := getRandomPort()
	if err != nil {
		return err
	}
	gqlPort, err := getRandomPort()
	if err != nil {
		return err
	}

	var a *account.Account
	a, err = account.New(
		account.WithName(accountName),
		account.WithPassphrase("secure"),
		account.WithDatabase(&account.DatabaseOptions{
			Path: datastorePath,
			Drop: false,
		}),
		account.WithP2PNetwork(createNetworkConfig()),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         fmt.Sprintf(":%d", grpcPort),
			Interceptors: false,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         fmt.Sprintf(":%d", gqlPort),
			Interceptors: false,
		}),
	)
	if err != nil {
		return err
	}
	defer account.Delete(a)

	err = a.Open()
	if err != nil {
		return err
	}
	defer a.Close()

	return <-a.ErrChan()
}
