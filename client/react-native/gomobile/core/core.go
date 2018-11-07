package core

import (
	"encoding/json"
	"fmt"
	"net"
	"strconv"
	"strings"
	"time"

	account "berty.tech/core/manager/account"
	reuse "github.com/libp2p/go-reuseport"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

var (
	accountName = ""
	appConfig   *account.StateDB
)

func logger() *zap.Logger {
	return zap.L().Named("client.rn.gomobile")
}

func panicHandler() {
	if r := recover(); r != nil {
		panicErr := errors.New(fmt.Sprintf("panic from global export: %+v", r))
		logger().Error(panicErr.Error())
		if accountName == "" {
			return
		}
		a, err := account.Get(accountName)
		if err != nil {
			return
		}
		a.ErrChan() <- panicErr
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

func Panic() {
	panic(nil)
}

func GetPort() (int, error) {

	defer panicHandler()

	a, err := account.Get(accountName)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(strings.Split(a.GQLBind, ":")[1])
}

func Initialize(loggerNative Logger) error {

	defer panicHandler()

	if err := setupLogger("debug", loggerNative); err != nil {
		return err
	}

	return nil
}

func ListAccounts(datastorePath string) (string, error) {

	defer panicHandler()

	accounts, err := account.List(datastorePath)
	if err != nil {
		return "", err
	}
	logger().Debug("ListAccounts", zap.Strings("acccounts", accounts))
	return strings.Join(accounts, ":"), nil
}

func initOrRestoreAppState(datastorePath string) error {
	initialJSONNetConf, err := json.Marshal(initialNetConf)
	if err != nil {
		return err
	}

	// Needed by OpenStateDB to init DB if no previous config is found (first launch)
	initialState := account.StateDB{
		JSONNetConf: string(initialJSONNetConf),
		BotMode:     initialBotMode,
	}

	appState, err := account.OpenStateDB(datastorePath+"berty.state.db", initialState)
	if err != nil {
		return errors.Wrap(err, "state DB init failed")
	}

	appConfig = appState
	return nil
}

func Start(nickname, datastorePath string, loggerNative Logger) error {

	defer panicHandler()

	accountName = nickname

	a, _ := account.Get(nickname)
	if a != nil {
		return errors.New("daemon already started")
	}

	if err := initOrRestoreAppState(datastorePath); err != nil {
		return errors.Wrap(err, "app init/restore state failed")
	}

	run(nickname, datastorePath, loggerNative)
	waitDaemon(nickname)
	return nil
}

func Restart() error {

	defer panicHandler()

	currentAccount, _ := account.Get(accountName)
	if currentAccount != nil {
		currentAccount.ErrChan() <- nil
	}

	waitDaemon(accountName)
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
	return Restart()
}

func run(nickname, datastorePath string, loggerNative Logger) {
	go func() {
		for {
			err := daemon(nickname, datastorePath, loggerNative)
			if err != nil {
				logger().Error("handle error, try to restart", zap.Error(err))
				time.Sleep(time.Second)
			} else {
				logger().Info("restarting daemon")
			}
		}
	}()
}

func waitDaemon(nickname string) {
	currentAccount, _ := account.Get(nickname)
	if currentAccount == nil || currentAccount.GQLBind == "" {
		logger().Debug("waiting for daemon to start")
		time.Sleep(time.Second)
		waitDaemon(nickname)
	}
}

func daemon(nickname, datastorePath string, loggerNative Logger) error {
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

	netConf, err := createNetworkConfig()
	if err != nil {
		return err
	}

	accountOptions := account.Options{
		account.WithRing(ring),
		account.WithName(nickname),
		account.WithPassphrase("secure"),
		account.WithDatabase(&account.DatabaseOptions{
			Path: datastorePath,
			Drop: false,
		}),
		account.WithP2PNetwork(netConf),
		account.WithGrpcServer(&account.GrpcServerOptions{
			Bind:         fmt.Sprintf(":%d", grpcPort),
			Interceptors: false,
		}),
		account.WithGQL(&account.GQLOptions{
			Bind:         fmt.Sprintf(":%d", gqlPort),
			Interceptors: false,
		}),
	}

	if appConfig.BotMode {
		accountOptions = append(accountOptions, account.WithBot())
	}

	a, err = account.New(accountOptions...)
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
