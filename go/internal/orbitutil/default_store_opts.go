package orbitutil

import (
	"encoding/hex"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/errcode"
)

func DefaultOptions(g *group.Group, options *orbitdb.CreateDBOptions, keystore *BertySignedKeyStore, storeType string) (*orbitdb.CreateDBOptions, error) {
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
	options.Create = boolPtr(true)

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

func defaultACForGroup(g *group.Group, storeType string) (accesscontroller.ManifestParams, error) {
	groupID, err := g.GroupIDAsString()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := g.SigningKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	param := &accesscontroller.CreateAccessControllerOptions{
		Access: map[string][]string{
			"write":            {hex.EncodeToString(signingKeyBytes)},
			IdentityGroupIDKey: {groupID},
			StoreTypeKey:       {storeType},
		},
		SkipManifest: true,
		Type:         "bertysimple",
	}

	return param, nil
}

func defaultIdentityForGroup(g *group.Group, ks *BertySignedKeyStore) (*identityprovider.Identity, error) {
	signingKeyBytes, err := g.SigningKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	identity, err := ks.GetIdentityProvider().CreateIdentity(&identityprovider.CreateIdentityOptions{
		Type:     IdentityType,
		Keystore: ks,
		ID:       hex.EncodeToString(signingKeyBytes),
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return identity, nil
}

func boolPtr(b bool) *bool {
	return &b
}
