package bertymessengertesting

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet"
	"berty.tech/weshnet/pkg/protocoltypes"
)

func NonMockedTestingInfra(t testing.TB, accountAmount int) ([]messengertypes.MessengerServiceClient, []*weshnet.TestingProtocol, func()) {
	messengers := make([]messengertypes.MessengerServiceClient, accountAmount)
	tps := make([]*weshnet.TestingProtocol, accountAmount)
	closeFuncs := ([]func())(nil)

	for i := 0; i < accountAmount; i++ {
		tempDir, err := ioutil.TempDir("", fmt.Sprintf("berty-main-%d", i))
		assert.NoError(t, err)

		closeFuncs = append(closeFuncs, func() {
			_ = os.RemoveAll(tempDir)
		})

		man, err := initutil.New(nil)
		assert.NoError(t, err)
		closeFuncs = append(closeFuncs, func() { _ = man.Close(nil) })

		fs := flag.NewFlagSet("man1", flag.ExitOnError)
		man.SetupLoggingFlags(fs)              // also available at root level
		man.SetupMetricsFlags(fs)              // add flags to enable metrics
		man.SetupLocalMessengerServerFlags(fs) // add flags to allow creating a full node in the same process
		man.SetupEmptyGRPCListenersFlags(fs)   // by default, we don't want to expose gRPC server for mini
		man.SetupRemoteNodeFlags(fs)           // mini can be run against an already running server
		man.SetupInitTimeout(fs)

		err = fs.Parse([]string{"-store.dir", tempDir})
		assert.NoError(t, err)

		ipfs, _, err := man.GetLocalIPFS()
		assert.NoError(t, err)
		closeFuncs = append(closeFuncs, func() { _ = ipfs.Close() })

		protocolClient, err := man.GetProtocolClient()
		assert.NoError(t, err)

		messengers[i], err = man.GetMessengerClient()
		assert.NoError(t, err)

		tps[i] = &weshnet.TestingProtocol{
			Client: &WrappedMessengerClient{protocolClient},
		}
	}

	return messengers, tps, func() {
		for i := len(closeFuncs) - 1; i >= 0; i-- {
			closeFuncs[i]()
		}
	}
}

type WrappedMessengerClient struct {
	protocoltypes.ProtocolServiceClient
}

func (*WrappedMessengerClient) Close() error {
	return nil
}
