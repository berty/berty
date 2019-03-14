package main

import (
	"encoding/json"

	"berty.tech/client/react-native/desktop/coreinterface"

	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
	"github.com/pkg/errors"
)

var ptrErrFunc = map[string]func() (interface{}, error){
	"initialize":        coreinterface.Initialize,
	"restart":           coreinterface.Restart,      // FIXME: crashes electron process
	"dropDatabase":      coreinterface.DropDatabase, // FIXME: crashes electron process
	"panic":             coreinterface.Panic,
	"startBot":          coreinterface.StartBot,
	"stopBot":           coreinterface.StopBot,
	"isBotRunning":      coreinterface.IsBotRunning,
	"getNetworkConfig":  coreinterface.GetNetworkConfig,
	"getLocalGRPCInfos": coreinterface.GetLocalGRPCInfos,
	"getPort":           coreinterface.GetPort,
	"listAccounts":      coreinterface.ListAccounts,
}

var ptrStrErrFunc = map[string]func(string) (interface{}, error){
	"start":               coreinterface.Start,
	"updateNetworkConfig": coreinterface.UpdateNetworkConfig,
	"openURL":             coreinterface.OpenURL,
}

func stringPayload(message json.RawMessage) (string, error) {
	payload := ""

	if err := json.Unmarshal(message, &payload); err != nil {
		return err.Error(), err
	}

	return payload, nil
}

// handleMessages handles messages
func handleMessages(_ *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
	fun, ok := ptrErrFunc[m.Name]
	if ok {
		val, err := fun()

		if err != nil {
			return err.Error(), err
		}

		return val, nil
	}

	strFun, ok := ptrStrErrFunc[m.Name]
	if ok {
		payload, err := stringPayload(m.Payload)

		if err != nil {
			return err.Error(), err
		}

		val, err := strFun(payload)

		if err != nil {
			return err.Error(), err
		}

		return val, nil
	}

	return nil, errors.New("unimplemented native method")
}
