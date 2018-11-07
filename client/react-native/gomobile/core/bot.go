package core

import (
	"errors"

	account "berty.tech/core/manager/account"
)

func IsBotRunning() bool {
	waitDaemon()
	currentAccount, _ := account.Get(accountName)

	return currentAccount.BotRunning
}

func StartBot() error {
	waitDaemon()
	currentAccount, _ := account.Get(accountName)

	if currentAccount.BotRunning {
		return errors.New("bot is already started")
	}

	return currentAccount.StartBot()
}

func StopBot() error {
	waitDaemon()
	currentAccount, _ := account.Get(accountName)

	if !currentAccount.BotRunning {
		return errors.New("bot is already stopped")
	}

	return currentAccount.StopBot()
}
