package bertyprotocol_test

import (
	"context"
	"testing"

	"berty.tech/berty/v2/go/internal/account"
	"berty.tech/berty/v2/go/internal/orbitutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/errcode"
	keystore "github.com/ipfs/go-ipfs-keystore"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestTestingClient_impl(t *testing.T) {
	service, cleanup := bertyprotocol.TestingService(t, bertyprotocol.Opts{
		Logger:        zap.NewNop(),
		Account:       account.New(keystore.NewMemKeystore()),
		MessageKeys:   bertyprotocol.NewInMemoryMessageKeys(),
		DBConstructor: orbitutil.NewBertyOrbitDB,
	})
	defer cleanup()

	client, cleanup := bertyprotocol.TestingClient(t, service)
	defer cleanup()

	// test service
	_, err := client.InstanceGetConfiguration(context.Background(), &bertyprotocol.InstanceGetConfiguration_Request{})
	assert.NoError(t, err)

	status := service.Status()
	expected := bertyprotocol.Status{}
	assert.Equal(t, expected, status)
}

func testSameErrcodes(t *testing.T, expected, got error) {
	t.Helper()

	assert.Equalf(
		t,
		errcode.ErrCode_name[errcode.Code(expected)],
		errcode.ErrCode_name[errcode.Code(got)],
		"%v", got,
	)
}
