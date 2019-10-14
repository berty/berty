package group

import (
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type Member struct {
	GroupAccountPrivKey        p2pcrypto.PrivKey
	GroupDevicePrivKey         p2pcrypto.PrivKey
	GroupDevicePubKeySignature []byte // Signed by GroupAccountPrivKey

	GroupInvitation             *Invitation
	GroupAccountPubKeySignature []byte // Signed by InvitationPrivKey

	DerivationState   []byte
	Counter           uint64
	RealAccountBinder []byte
}

// func MemberCreate(ir *InvitationRequest, accountShrdSec []byte) (*Member, error) {
// 	groupIDRaw, err := ir.group.ID.Raw()
// 	if err != nil {
// 		return nil, errors.Wrap(err, "can't get group pubkey raw value")
// 	}
//
// 	/**
// 	 * Generates a deterministic GroupAccountKeypair predictable by all devices
// 	 * linked to the same account using group and account secrets.
// 	 * Devices will be able to join the group in a full asynchronous way.
// 	 */
// 	seedReader := hkdf.New(sha256.New, accountShrdSec, ir.group.SharedSecret, groupIDRaw)
//
// 	groupAccountPrivKey, groupAccountPubKey, err := p2pcrypto.GenerateKeyPairWithReader(p2pcrypto.Ed25519, 256, seedReader)
// 	if err != nil {
// 		return nil, errors.Wrap(err, "group account keypair generation failed")
// 	}
//
// 	/**
// 	 * Generates a random GroupDeviceKeypair then signs it using
// 	 * GroupAccountPrivKey to prove this device is linked to this account.
// 	 */
// 	groupDevicePrivKey, groupDevicePubKey, err := p2pcrypto.GenerateKeyPair(p2pcrypto.Ed25519, 256)
// 	if err != nil {
// 		return nil, errors.Wrap(err, "group device keypair generation failed")
// 	}
//
// 	groupDevicePubRaw, err := groupDevicePubKey.Raw()
// 	if err != nil {
// 		return nil, errors.Wrap(err, "can't get group device pubkey raw value")
// 	}
//
// 	groupDevicePubKeySignature, err := groupAccountPrivKey.Sign(groupDevicePubRaw)
// 	if err != nil {
// 		return nil, errors.Wrap(err, "group device pubkey signature failed")
// 	}
//
// 	/**
// 	 * Signs GroupAccountPubKey with InvitationPrivKey to prove this account
// 	 * was in possession of secret part of the invitation.
// 	 */
// 	groupAccountPubKeySignature, err := ir.invitation.InvitationPrivKey.Sign(groupAccountPubKeyRaw)
// 	if err != nil {
// 		return nil, errors.Wrap(err, "group account pubkey signature failed")
// 	}
//
// 	derivationState := make([]byte, 32)
// 	if _, err := io.ReadFull(cryptorand.Reader, derivationState); err != nil {
// 		return nil, errors.Wrap(err, "derivation state generation failed")
// 	}
//
// 	counterBuf := make([]byte, 8)
// 	if _, err := io.ReadFull(cryptorand.Reader, counterBuf); err != nil {
// 		return nil, errors.Wrap(err, "counter generation failed")
// 	}
//
// 	counter, read := binary.Uvarint(counterBuf)
// 	if read != len(counterBuf) {
// 		return nil, errors.Wrap(err, "counter conversion failed")
// 	}
//
// 	return &Member{
// 		// Version: 1, ???
// 		GroupAccountPrivKey:         groupAccountPrivKey,
// 		GroupDevicePrivKey:          groupDevicePrivKey,
// 		GroupDevicePubKeySignature:  groupDevicePubKeySignature,
// 		InviterGroupAccountPubKey:   ir.invitation.InviterGroupAccountPubKey,
// 		InvitationPubKey:            ir.invitation.InvitationPrivKey.GetPublic(),
// 		InvitationPubKeySignature:   ir.invitation.InvitationPubKeySignature,
// 		GroupAccountPubKeySignature: groupAccountPubKeySignature,
// 		DerivationState:             derivationState,
// 		Counter:                     counter,
// 		RealAccountBinder:           nil, // ???
// 	}, nil
// }
