package bertymessenger

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func isGroupMessageEventFromSelf(ctx context.Context, client protocoltypes.ProtocolServiceClient, gme *protocoltypes.GroupMessageEvent) (bool, error) {
	return isFromSelf(ctx, client, gme.GetEventContext().GetGroupPK(), gme.GetHeaders().GetDevicePK())
}

func isFromSelf(ctx context.Context, client protocoltypes.ProtocolServiceClient, gpkb []byte, messageDevicePK []byte) (bool, error) {
	// TODO: support multiple devices per account
	gi, err := client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return false, err
	}

	groupDevicePK := gi.GetDevicePK()

	return bytes.Equal(groupDevicePK, messageDevicePK), nil
}

func groupPKFromContactPK(ctx context.Context, client protocoltypes.ProtocolServiceClient, contactPK []byte) ([]byte, error) {
	req := &protocoltypes.GroupInfo_Request{ContactPK: contactPK}
	groupInfo, err := client.GroupInfo(ctx, req)
	if err != nil {
		return nil, err
	}

	groupPK := groupInfo.GetGroup().GetPublicKey()
	if groupPK == nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("group pk is empty"))
	}

	return groupPK, nil
}

func b64EncodeBytes(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func b64DecodeBytes(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

func timestampMs(t time.Time) int64 {
	return t.UnixNano() / 1000000
}
