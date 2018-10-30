package core

import (
	"errors"
	"fmt"
	"net"
	"os"
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
	currentAccount *account.Account
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
	if currentAccount == nil || currentAccount.GQLBind == "" {
		return 0, errors.New("wait for daemon to start")
	}
	return strconv.Atoi(strings.Split(currentAccount.GQLBind, ":")[1])
}

func Start(datastorePath string, loggerNative Logger) error {
	if currentAccount != nil {
		return errors.New("daemon already started")
	}
	if err := initLogger(loggerNative); err != nil {
		return err
	}

	name := os.Getenv("USER")
	if name == "" {
		name = "new-berty-user"
	}

	grpcPort, err := getRandomPort()
	if err != nil {
		return err
	}
	gqlPort, err := getRandomPort()
	if err != nil {
		return err
	}

	currentAccount, err = account.New(
		account.WithName(name),
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

	err = currentAccount.Open()
	if err != nil {
		currentAccount.Close()
		currentAccount = nil
		return err
	}

	go func() {
		err := <-currentAccount.ErrChan()
		logger().Error("handle account error, try to restart", zap.Error(err))
		for {
			if currentAccount == nil {
				err = Start(datastorePath, loggerNative)
			} else {
				err = Restart(datastorePath, loggerNative)
			}
			if err != nil {
				logger().Error("restart error", zap.Error(err))
				time.Sleep(time.Second)
				continue
			}
			break
		}
	}()

	return nil
}

func Restart(datastorePath string, logger Logger) error {
	if currentAccount == nil {
		return errors.New("daemon not started")
	}
	currentAccount.Close()
	currentAccount = nil
	return Start(datastorePath, logger)
}
