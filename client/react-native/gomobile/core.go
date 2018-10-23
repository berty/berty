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

var (
	defaultBootstrap = []string{
		"/ip4/104.248.78.238/tcp/4004/ipfs/QmPCbsVWDtLTdCtwfp5ftZ96xccUNe4hegKStgbss8YACT",
	}
	accountName = "new-berty-user"
)

func initLogger(logger Logger) error {
	if err := setupLogger("debug", logger); err != nil {
		return err
	}

	// initialize logger
	cfg := zap.NewDevelopmentConfig()
	cfg.Level.SetLevel(zap.DebugLevel)
	l, err := cfg.Build()
	if err != nil {
		return err
	}
	zap.ReplaceGlobals(l)
	return nil
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
	currentAccount, _ := account.Get(accountName)
	if currentAccount == nil || currentAccount.GQLBind == "" {
		logger().Debug("waiting for daemon to start")
		time.Sleep(time.Second)
		return GetPort()
	}
	return strconv.Atoi(strings.Split(currentAccount.GQLBind, ":")[1])
}

func Start(datastorePath string, loggerNative Logger) error {
	if err := initLogger(loggerNative); err != nil {
		return err
	}
	a, _ := account.Get(accountName)
	if a != nil {
		return errors.New("daemon already started")
	}
	go func() {
		for {
			err := daemon(datastorePath, loggerNative)
			if err != nil {
				logger().Error("handle error, try to restart", zap.Error(err))
			} else {
				logger().Info("restarting daemon")
			}
		}
	}()
	return nil
}

func Restart(datastorePath string, loggerNative Logger) error {
	currentAccount, _ := account.Get(accountName)
	if currentAccount != nil {
		currentAccount.Close()
		account.Remove(currentAccount)
		currentAccount = nil
	} else {
		go func() {
			for {
				err := daemon(datastorePath, loggerNative)
				if err != nil {
					logger().Error("handle error, try to restart", zap.Error(err))
				} else {
					logger().Info("restarting daemon")
				}
			}
		}()
	}
	return nil
}

func daemon(datastorePath string, loggerNative Logger) error {

	a := &account.Account{}
	defer a.PanicHandler()

	grpcPort, err := getRandomPort()
	if err != nil {
		return err
	}
	gqlPort, err := getRandomPort()
	if err != nil {
		return err
	}

	a, err = account.New(
		account.WithName(accountName),
		account.WithPassphrase("secure"),
		account.WithDatabase(&account.DatabaseOptions{
			Path: datastorePath,
			Drop: false,
		}),
		account.WithP2PNetwork(
			&account.P2PNetworkOptions{
				Bind:      nil,
				Bootstrap: defaultBootstrap,
				MDNS:      false,
				Relay:     false,
				Metrics:   true,
				Identity:  "",
			},
		),
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

	err = a.Open()
	if err != nil {
		a.Close()
		account.Remove(a)
		a = nil
		return err
	}
	return <-a.ErrChan()
}
