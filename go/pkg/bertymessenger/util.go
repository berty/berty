package bertymessenger

import (
	"bytes"
	"context"
	"encoding/base64"
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func checkIsMe(ctx context.Context, client bertyprotocol.ProtocolServiceClient, gme *bertytypes.GroupMessageEvent) (bool, error) {
	gpkb := gme.GetEventContext().GetGroupPK()

	// TODO: support multiple devices per account
	gi, err := client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return false, err
	}

	dpk := gi.GetDevicePK()
	mdpk := gme.GetHeaders().GetDevicePK()

	return bytes.Equal(dpk, mdpk), nil
}

func groupPKFromContactPK(ctx context.Context, client bertyprotocol.ProtocolServiceClient, contactPK []byte) ([]byte, error) {
	req := &bertytypes.GroupInfo_Request{ContactPK: contactPK}
	groupInfo, err := client.GroupInfo(ctx, req)
	if err != nil {
		return nil, err
	}

	groupPK := groupInfo.GetGroup().GetPublicKey()
	if groupPK == nil {
		return nil, errcode.ErrInternal
	}

	return groupPK, nil
}

func bytesToString(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func stringToBytes(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

func timestampMs(t time.Time) int64 {
	return t.UnixNano() / 1000000
}
