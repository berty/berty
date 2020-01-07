package storesecret_test

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"

	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/internal/orbitutil/orbittestutil"
	"berty.tech/berty/go/internal/orbitutil/storesecret"
)

func TestSecretStore_Basic(t *testing.T) {
	// TODO: handle more cases
	memberCount := 2
	deviceCount := 1

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peers, firstInvitation := orbittestutil.CreatePeersWithGroup(ctx, t, "/tmp/secrets_test", memberCount, deviceCount, true)
	defer orbittestutil.DropPeers(t, peers)

	storesecret.SendSecretsToNewMembers(ctx, zap.NewNop(), peers[0].GetGroupContext())
	storesecret.SendSecretsToNewMembers(ctx, zap.NewNop(), peers[1].GetGroupContext())

	wg := sync.WaitGroup{}
	wg.Add(2)

	go func() {
		orbitutil.WaitStoreReplication(ctx, 5*time.Second, peers[0].GetGroupContext().GetSecretStore())
		wg.Done()
	}()

	go func() {
		orbitutil.WaitStoreReplication(ctx, 5*time.Second, peers[1].GetGroupContext().GetSecretStore())
		wg.Done()
	}()

	orbittestutil.InviteAllPeersToGroup(ctx, t, peers, firstInvitation)

	// Only sending secrets from A
	err := storesecret.SendSecretsToCurrentMembers(ctx, peers[0].GetGroupContext())
	assert.NoError(t, err)

	wg.Wait()

	secretStoreA := peers[0].GetGroupContext().GetSecretStore()
	secretStoreB := peers[1].GetGroupContext().GetSecretStore()

	devPkA := peers[0].GetGroupContext().GetDevicePrivKey().GetPublic()
	devPkB := peers[1].GetGroupContext().GetDevicePrivKey().GetPublic()

	secretAForB, err := secretStoreB.GetDeviceSecret(devPkA)
	assert.NoError(t, err)

	secretBforA, err := secretStoreA.GetDeviceSecret(devPkB)
	assert.NoError(t, err)

	secretAforA := peers[0].GetGroupContext().GetDeviceSecret()
	secretBforB := peers[1].GetGroupContext().GetDeviceSecret()

	assert.Equal(t, secretAforA.DerivationState, secretAForB.DerivationState)
	assert.Equal(t, secretAforA.Counter, secretAForB.Counter)

	assert.Equal(t, secretBforB.DerivationState, secretBforA.DerivationState)
	assert.Equal(t, secretBforB.Counter, secretBforA.Counter)
}
