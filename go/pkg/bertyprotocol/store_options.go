package bertyprotocol

import (
	"context"
	"encoding/hex"

	"github.com/libp2p/go-libp2p/p2p/host/eventbus"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
)

func DefaultOrbitDBOptions(g *protocoltypes.Group, options *orbitdb.CreateDBOptions, keystore *BertySignedKeyStore, storeType string, groupOpenMode GroupOpenMode) (*orbitdb.CreateDBOptions, error) {
	var err error

	if options == nil {
		options = &orbitdb.CreateDBOptions{}
	}

	t := true
	options.Create = &t

	if options.EventBus == nil {
		options.EventBus = eventbus.NewBus()
	}

	if options.AccessController == nil {
		options.AccessController, err = defaultACForGroup(g, storeType)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	options.Keystore = keystore
	if groupOpenMode != GroupOpenModeReplicate {
		options.Identity, err = defaultIdentityForGroup(context.TODO(), g, keystore)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	} else {
		options.Identity, err = readIdentityForGroup(g, keystore)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	return options, nil
}

func defaultACForGroup(g *protocoltypes.Group, storeType string) (accesscontroller.ManifestParams, error) {
	groupID := g.GroupIDAsString()

	sigPK, err := g.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := sigPK.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	access := map[string][]string{
		"write":            {hex.EncodeToString(signingKeyBytes)},
		identityGroupIDKey: {groupID},
		storeTypeKey:       {storeType},
	}

	address, err := simpleAccessControllerCID(access)
	if err != nil {
		return nil, err
	}

	param := &accesscontroller.CreateAccessControllerOptions{
		Access:       access,
		SkipManifest: true,
		Type:         "bertysimple",
		Address:      address,
	}

	return param, nil
}

func defaultIdentityForGroup(ctx context.Context, g *protocoltypes.Group, ks *BertySignedKeyStore) (*identityprovider.Identity, error) {
	sigPK, err := g.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := sigPK.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	identity, err := ks.getIdentityProvider().createIdentity(ctx, &identityprovider.CreateIdentityOptions{
		Type:     identityType,
		Keystore: ks,
		ID:       hex.EncodeToString(signingKeyBytes),
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return identity, nil
}

func readIdentityForGroup(g *protocoltypes.Group, ks *BertySignedKeyStore) (*identityprovider.Identity, error) {
	sigPK, err := g.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := sigPK.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &identityprovider.Identity{
		ID:         hex.EncodeToString(signingKeyBytes),
		PublicKey:  g.PublicKey,
		Signatures: &identityprovider.IdentitySignature{},
		Type:       ks.getIdentityProvider().GetType(),
		Provider:   ks.getIdentityProvider(),
	}, nil
}
