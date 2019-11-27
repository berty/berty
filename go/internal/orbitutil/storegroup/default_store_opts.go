package storegroup

import (
	"encoding/hex"

	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/identityberty"
	"berty.tech/go/pkg/errcode"
)

func DefaultOptions(g *group.Group, options *orbitdb.CreateDBOptions, keystore *identityberty.BertySignedKeyStore) (*orbitdb.CreateDBOptions, error) {
	var err error

	if options == nil {
		options = &orbitdb.CreateDBOptions{}
	}
	options.Create = boolPtr(true)

	if options.AccessController == nil {
		options.AccessController, err = defaultACForGroup(g)
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

func defaultACForGroup(g *group.Group) (accesscontroller.ManifestParams, error) {
	groupID, err := g.GroupIDAsString()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signingKeyBytes, err := g.SigningKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	param := accesscontroller.NewSimpleManifestParams("simple", map[string][]string{
		"write":                  {hex.EncodeToString(signingKeyBytes)},
		identityberty.GroupIDKey: {groupID},
	})

	return param, nil
}

func defaultIdentityForGroup(g *group.Group, ks *identityberty.BertySignedKeyStore) (*identityprovider.Identity, error) {
	signingKeyBytes, err := g.SigningKey.GetPublic().Raw()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	identity, err := ks.GetIdentityProvider().CreateIdentity(&identityprovider.CreateIdentityOptions{
		Type:     identityberty.IdentityType,
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
