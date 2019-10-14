package group

import (
	"context"
	cryptorand "crypto/rand"
	"encoding/base64"
	"fmt"
	"io"

	"github.com/pkg/errors"

	orbitdb "berty.tech/go-orbit-db"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type Group struct {
	Version      uint32
	IDPub        p2pcrypto.PubKey
	IDPriv       p2pcrypto.PrivKey
	SharedSecret []byte
	Messages     orbitdb.EventLogStore
	Members      orbitdb.EventLogStore
	Secrets      orbitdb.EventLogStore
	Settings     orbitdb.EventLogStore
}

func New(ctx context.Context, odb orbitdb.OrbitDB) (*Group, error) {
	/**
	 * This group keypair will be used for group identification:
	 * - the public key will be set as group ID
	 * - the private key will be used to invit the group creator as first member
	 * The private key will then be discarded.
	 */
	groupIDPriv, groupIDPub, err := p2pcrypto.GenerateKeyPair(p2pcrypto.Ed25519, 256)
	if err != nil {
		return nil, errors.Wrap(err, "group keypair generation failed")
	}

	sharedSecret := make([]byte, 32)
	if _, err := io.ReadFull(cryptorand.Reader, sharedSecret); err != nil {
		return nil, errors.Wrap(err, "shared secret generation failed")
	}

	group := &Group{
		Version:      1,
		IDPub:        groupIDPub,
		IDPriv:       groupIDPriv,
		SharedSecret: sharedSecret,
	}

	groupIDRaw, err := groupIDPub.Raw()
	if err != nil {
		return nil, errors.Wrap(err, "can't get group pubkey raw value")
	}
	logPrefix := base64.StdEncoding.EncodeToString(groupIDRaw)

	// TODO: Create manifests with relevant "validator" so a wrong entry wont be replicated
	group.Messages, err = odb.Log(ctx, fmt.Sprintf("%s_messages", logPrefix), nil)
	if err != nil {
		return nil, errors.Wrap(err, "messages log creation failed")
	}
	group.Members, err = odb.Log(ctx, fmt.Sprintf("%s_members", logPrefix), nil)
	if err != nil {
		group.DropAllLogs()
		return nil, errors.Wrap(err, "members log creation failed")
	}
	group.Secrets, err = odb.Log(ctx, fmt.Sprintf("%s_secrets", logPrefix), nil)
	if err != nil {
		group.DropAllLogs()
		return nil, errors.Wrap(err, "secrets log creation failed")
	}
	group.Settings, err = odb.Log(ctx, fmt.Sprintf("%s_settings", logPrefix), nil)
	if err != nil {
		group.DropAllLogs()
		return nil, errors.Wrap(err, "settings log creation failed")
	}

	return group, nil
}

func (g *Group) DropAllLogs() {
	if g.Messages != nil {
		_ = g.Messages.Drop()
	}
	if g.Members != nil {
		_ = g.Members.Drop()
	}
	if g.Secrets != nil {
		_ = g.Messages.Drop()
	}
	if g.Secrets != nil {
		_ = g.Settings.Drop()
	}
}

func (g *Group) Validate() error {
	return ErrNotImplemented
}
