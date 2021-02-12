package bertyaccount

import (
	"encoding/hex"
	"testing"

	"github.com/golang/protobuf/proto"
	"github.com/stretchr/testify/require"
)

func TestFailingProto(t *testing.T) {
	metaBytes, err := hex.DecodeString("0a013012013018cde6c2e3e5cded02")
	require.NoError(t, err)

	/*
	 Field #1: 0A String Length = 1, Hex = 01, UTF8 = "0"
	 Field #2: 12 String Length = 1, Hex = 01, UTF8 = "0"
	 Field #3: 18 Varint Value = 1607959997100877, Hex = CD-E6-C2-E3-E5-CD-ED-02
	*/

	meta := &AccountMetadata{}
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
