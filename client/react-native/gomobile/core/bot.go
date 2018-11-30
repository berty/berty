package core

import (
	account "berty.tech/core/manager/account"
	"github.com/pkg/errors"
)

func IsBotRunning() bool {
	defer panicHandler()
	waitDaemon(accountName)
	currentAccount, _ := account.Get(rootContext, accountName)

	return currentAccount.BotRunning
}

func StartBot() error {
	defer panicHandler()
	waitDaemon(accountName)
	currentAccount, _ := account.Get(rootContext, accountName)

	if currentAccount.BotRunning {
		return errors.New("bot is already started")
	}

	// TODO: re-enable this when account.StopBot() will be implemented
	// appConfig.BotMode = true
	// appConfig.StartCounter++
	// if err := appConfig.Save(); err != nil {
	// 	return errors.Wrap(err, "state DB save failed")
	// }

	return currentAccount.StartBot(rootContext)
}

func StopBot() error {
	defer panicHandler()
	waitDaemon(accountName)
	currentAccount, _ := account.Get(rootContext, accountName)

	if !currentAccount.BotRunning {
		return errors.New("bot is already stopped")
	}

	// TODO: re-enable this when account.StopBot() will be implemented
	// appConfig.BotMode = false
	// appConfig.StartCounter++
	// if err := appConfig.Save(); err != nil {
	// 	return errors.Wrap(err, "state DB save failed")
	// }

	return currentAccount.StopBot(rootContext)
}
