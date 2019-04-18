package main

import (
	"encoding/json"

	"berty.tech/client/react-native/desktop/coreinterface"

	astilectron "github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
	"github.com/pkg/errors"
)

var ptrErrFunc = map[string]func() (interface{}, error){
	// "initialize":        coreinterface.Initialize,               // @deprecate
	// "restart":           coreinterface.Restart,                  // @deprecate
	// "dropDatabase":      coreinterface.DropDatabase,             // @deprecate
	// "panic":             coreinterface.Panic,                    // @deprecate
	// "startBot":          coreinterface.StartBot,                 // @deprecate
	// "stopBot":           coreinterface.StopBot,                  // @deprecate
	// "isBotRunning":      coreinterface.IsBotRunning,             // @deprecate
	// "getNetworkConfig":  coreinterface.GetNetworkConfig,         // @deprecate
	// "getLocalGRPCInfos": coreinterface.GetLocalGRPCInfos,        // @deprecate
	// "getPort":           coreinterface.GetPort,                  // @deprecate
	// "listAccounts":      coreinterface.ListAccounts,             // @deprecate
}

var ptrStrErrFunc = map[string]func(string) (interface{}, error){

	// "start":               coreinterface.Start,			// @deprecate
	// "updateNetworkConfig": coreinterface.UpdateNetworkConfig,	// @deprecate
	"openURL":       coreinterface.OpenURL,
	"installUpdate": coreinterface.InstallUpdate,
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
