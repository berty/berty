package bertymessenger

import (
	"bytes"
	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (svc *service) checkIsMe(gme *bertytypes.GroupMessageEvent) (bool, error) {
	gpkb := gme.GetEventContext().GetGroupPK()

	// TODO: support multiple devices per account
	gi, err := svc.protocolClient.GroupInfo(svc.ctx, &bertytypes.GroupInfo_Request{GroupPK: gpkb})
	if err != nil {
		return false, err
	}

	dpk := gi.GetDevicePK()
	mdpk := gme.GetHeaders().GetDevicePK()

	return bytes.Equal(dpk, mdpk), nil
}

func (svc *service) groupPKFromContactPK(contactPK []byte) ([]byte, error) {
	req := &bertytypes.GroupInfo_Request{ContactPK: contactPK}
	groupInfo, err := svc.protocolClient.GroupInfo(svc.ctx, req)
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
