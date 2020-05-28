package bertychat

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/url"

	"berty.tech/berty/v2/go/internal/discordlog"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) DevShareInstanceBertyID(ctx context.Context, req *DevShareInstanceBertyID_Request) (*DevShareInstanceBertyID_Reply, error) {
	ret, err := s.InstanceShareableBertyID(ctx, &InstanceShareableBertyID_Request{
		DisplayName: req.DisplayName,
		Reset_:      req.Reset_,
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	err = discordlog.ShareQRLink(ret.DisplayName, discordlog.QRCodeRoom, "Add me on Berty!", ret.BertyID, ret.HTMLURL)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return nil, nil
}

func (s *service) InstanceShareableBertyID(ctx context.Context, req *InstanceShareableBertyID_Request) (*InstanceShareableBertyID_Reply, error) {
	if req == nil {
		req = &InstanceShareableBertyID_Request{}
	}
	config, err := s.protocol.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	s.logger.Debug("enable contact request (may be already done)")
	_, err = s.protocol.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if req.Reset_ {
		s.logger.Info("reset contact reference")
		_, err = s.protocol.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}

	res, err := s.protocol.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	// if this call does not return a PublicRendezvousSeed, then we need to call Reset
	if res.PublicRendezvousSeed == nil {
		s.logger.Info("reset contact reference")
		_, err = s.protocol.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	}
	res, err = s.protocol.ContactRequestReference(ctx, &bertytypes.ContactRequestReference_Request{})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	displayName := req.DisplayName
	if displayName == "" {
		// FIXME: get it from somewhere
		displayName = "anonymous#1337"
	}

	ret := InstanceShareableBertyID_Reply{
		DisplayName: displayName,
	}
	ret.BertyID = fmt.Sprintf(
		"%s %s %s",
		base64.StdEncoding.EncodeToString([]byte(displayName)),
		base64.StdEncoding.EncodeToString(res.PublicRendezvousSeed),
		base64.StdEncoding.EncodeToString(config.AccountPK),
	)
	ret.DeepLink = fmt.Sprintf("berty://%s", url.PathEscape(ret.BertyID))
	ret.HTMLURL = fmt.Sprintf("https://berty.tech/id#key=%s&name=%s", url.PathEscape(ret.BertyID), url.PathEscape(displayName))

	return &ret, nil
}
