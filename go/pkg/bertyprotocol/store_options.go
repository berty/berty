package bertyprotocol

import (
	"encoding/hex"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-ipfs-log/identityprovider"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/accesscontroller"
)

func DefaultOrbitDBOptions(g *bertytypes.Group, options *orbitdb.CreateDBOptions, keystore *BertySignedKeyStore, storeType string, groupOpenMode GroupOpenMode) (*orbitdb.CreateDBOptions, error) {
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
	if groupOpenMode != GroupOpenModeReplicate {
		options.Identity, err = defaultIdentityForGroup(g, keystore)
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

func readIdentityForGroup(g *bertytypes.Group, ks *BertySignedKeyStore) (*identityprovider.Identity, error) {
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
