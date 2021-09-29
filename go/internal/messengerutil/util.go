package messengerutil

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"time"

	ipfscid "github.com/ipfs/go-cid"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	TyberEventAcknowledgeReceived = "Acknowledge received"
)

func CheckDeviceIsMe(ctx context.Context, client protocoltypes.ProtocolServiceClient, gme *protocoltypes.GroupMessageEvent) (bool, error) {
	gpkb := gme.GetEventContext().GetGroupPK()

	// TODO: support multiple devices per account
	gi, err := client.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return false, err
	}

	dpk := gi.GetDevicePK()
	mdpk := gme.GetHeaders().GetDevicePK()

	return bytes.Equal(dpk, mdpk), nil
}

func GroupPKFromContactPK(ctx context.Context, client protocoltypes.ProtocolServiceClient, contactPK []byte) ([]byte, error) {
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

func B64EncodeBytes(b []byte) string {
	return base64.RawURLEncoding.EncodeToString(b)
}

func B64DecodeBytes(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

func TimestampMs(t time.Time) int64 {
	return t.UnixNano() / 1000000
}

func EnsureValidBase64CID(str string) error {
	cidBytes, err := B64DecodeBytes(str)
	if err != nil {
		return fmt.Errorf("decode base64: %s", err.Error())
	}

	_, err = ipfscid.Cast(cidBytes)
	if err != nil {
		return fmt.Errorf("decode cid: %s", err.Error())
	}

	return nil
}
