package bertyaccount

import (
	"encoding/hex"
	"testing"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/accounttypes"
)

func TestFailingProto(t *testing.T) {
	metaBytes, err := hex.DecodeString("0a013012013018cde6c2e3e5cded02")
	require.NoError(t, err)

	/*
	 Field #1: 0A String Length = 1, Hex = 01, UTF8 = "0"
	 Field #2: 12 String Length = 1, Hex = 01, UTF8 = "0"
	 Field #3: 18 Varint Value = 1607959997100877, Hex = CD-E6-C2-E3-E5-CD-ED-02
	*/

	meta := &accounttypes.AccountMetadata{}
	/*
		-> diff. 3rd field

		type AccountMetadata struct {
			AccountID            string   `protobuf:"bytes,1,opt,name=account_id,json=accountId,proto3" json:"account_id,omitempty"`
			Name                 string   `protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"`
			AvatarCID            string   `protobuf:"bytes,3,opt,name=avatar_cid,json=avatarCid,proto3" json:"avatar_cid,omitempty"`
			PublicKey            string   `protobuf:"bytes,4,opt,name=public_key,json=publicKey,proto3" json:"public_key,omitempty"`
			LastOpened           int64    `protobuf:"varint,5,opt,name=last_opened,json=lastOpened,proto3" json:"last_opened,omitempty"`
			CreationDate         int64    `protobuf:"varint,6,opt,name=creation_date,json=creationDate,proto3" json:"creation_date,omitempty"`
			Error                string   `protobuf:"bytes,7,opt,name=error,proto3" json:"error,omitempty"`
			XXX_NoUnkeyedLiteral struct{} `json:"-"`
			XXX_unrecognized     []byte   `json:"-"`
			XXX_sizecache        int32    `json:"-"`
		}
	*/

	err = proto.Unmarshal(metaBytes, meta)
	require.Error(t, err)
}

func TestSanitizeCheckMultiAddr(t *testing.T) {
	err := SanitizeCheckMultiAddr([]string{})
	require.NoError(t, err)

	err = SanitizeCheckMultiAddr([]string{
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
		"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",      // mars.i.ipfs.io
		"/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ", // mars.i.ipfs.io
	})
	require.NoError(t, err)

	err = SanitizeCheckMultiAddr([]string{initutil.KeywordDefault})
	require.NoError(t, err)

	err = SanitizeCheckMultiAddr([]string{initutil.KeywordNone})
	require.NoError(t, err)

	err = SanitizeCheckMultiAddr([]string{
		initutil.KeywordDefault,
		"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	})
	require.NoError(t, err)

	err = SanitizeCheckMultiAddr([]string{
		initutil.KeywordNone,
		"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
	})
	require.Error(t, err)

	err = SanitizeCheckMultiAddr([]string{
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
		"/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
		"/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",      // mars.i.ipfs.io
		"/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ", // mars.i.ipfs.io
		"failed",
	})
	require.Error(t, err)

	err = SanitizeCheckMultiAddr([]string{"failed"})
	require.Error(t, err)
}
