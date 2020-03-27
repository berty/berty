package bertyprotocol

import (
	"encoding/hex"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
)

func DefaultOrbitDBOptions(g *bertytypes.Group, options *orbitdb.CreateDBOptions, keystore *BertySignedKeyStore, storeType string) (*orbitdb.CreateDBOptions, error) {
	var err error

	if options == nil {
		options = &orbitdb.CreateDBOptions{}
	}

	options = &orbitdb.CreateDBOptions{
		Directory:               options.Directory,
		Overwrite:               options.Overwrite,
		LocalOnly:               options.LocalOnly,
		StoreType:               options.StoreType,
		AccessControllerAddress: options.AccessControllerAddress,
		AccessController:        options.AccessController,
		Replicate:               options.Replicate,
		Cache:                   options.Cache,
	}

	t := true
	options.Create = &t

	if options.AccessController == nil {
		options.AccessController, err = defaultACForGroup(g, storeType)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	options.Keystore = keystore
	options.Identity, err = defaultIdentityForGroup(g, keystore)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return options, nil
}

func defaultACForGroup(g *bertytypes.Group, storeType string) (accesscontroller.ManifestParams, error) {
	groupID := g.GroupIDAsString()

	sigPK, err := g.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := sigPK.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	param := &accesscontroller.CreateAccessControllerOptions{
		Access: map[string][]string{
			"write":            {hex.EncodeToString(signingKeyBytes)},
			identityGroupIDKey: {groupID},
			storeTypeKey:       {storeType},
		},
		SkipManifest: true,
		Type:         "bertysimple",
	}

	return param, nil
}

func defaultIdentityForGroup(g *bertytypes.Group, ks *BertySignedKeyStore) (*identityprovider.Identity, error) {
	sigPK, err := g.GetSigningPubKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := sigPK.Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	identity, err := ks.getIdentityProvider().createIdentity(&identityprovider.CreateIdentityOptions{
		Type:     identityType,
		Keystore: ks,
		ID:       hex.EncodeToString(signingKeyBytes),
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return identity, nil
}
