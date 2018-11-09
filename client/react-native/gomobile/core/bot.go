package core

import (
	"github.com/pkg/errors"

	account "berty.tech/core/manager/account"
)

func IsBotRunning() bool {
	waitDaemon(accountName)
	currentAccount, _ := account.Get(accountName)

	return currentAccount.BotRunning
}

func StartBot() error {
	waitDaemon(accountName)
	currentAccount, _ := account.Get(accountName)

	if currentAccount.BotRunning {
		return errors.New("bot is already started")
	}

	// TODO: re-enable this when account.StopBot() will be implemented
	// appConfig.BotMode = true
	// appConfig.StartCounter++
	// if err := appConfig.Save(); err != nil {
	// 	return errors.Wrap(err, "state DB save failed")
	// }

	return currentAccount.StartBot()
}

func StopBot() error {
	waitDaemon(accountName)
	currentAccount, _ := account.Get(accountName)

	if !currentAccount.BotRunning {
		return errors.New("bot is already stopped")
	}

	// TODO: re-enable this when account.StopBot() will be implemented
	// appConfig.BotMode = false
	// appConfig.StartCounter++
	// if err := appConfig.Save(); err != nil {
	// 	return errors.Wrap(err, "state DB save failed")
	// }

	return currentAccount.StopBot()
}
