package bertyprotocol

import (
	context "context"

	"berty.tech/go/internal/group"
	"github.com/pkg/errors"
)

func (c *client) GroupCreate(ctx context.Context, gcreq *GroupCreateRequest) (*GroupCreateReply, error) {
	g, err := group.New(ctx, c.odb)
	if err != nil {
		return nil, errors.Wrap(err, "group creation failed")
	}

	creatorInvitation, err := group.InvitationCreate(g.IDPriv)
	if err != nil {
		g.DropAllLogs()
		return nil, errors.Wrap(err, "group creator invitation failed")
	}
	_ = creatorInvitation // REMOVE ME

	// TODO: Invit myself using groupIDPriv
	// - Fetch own group info in DB or get them in *client?
	// - Send creator invitation to myself: send(ownGroup, creatorInvitation)
	// - Call invitationAccept / get creatorGroupAccountPriv

	// initMemberInvitation, err := group.InvitationCreate(creatorGroupAccountPriv)
	// if err != nil {
	// 	g.DropAllLogs()
	// 	// Creator should GroupLeave?
	// 	return nil, errors.Wrap(err, "group creator invitation failed")
	// }

	for id := range gcreq.ContactIDs {
		// Get contact group
		// Send invit: send(ownGroup, initMemberInvitation)
		_ = id // REMOVE ME
	}

	// Last step: pins the logs

	return &GroupCreateReply{}, nil
}

func (c *client) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	// Send leave message
	// Set group to "left" in DB / remove group from DB.
	return nil, ErrNotImplemented
}

func (c *client) GroupList(*GroupListRequest, Instance_GroupListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupGetSettings(context.Context, *GroupGetSettingsRequest) (*GroupGetSettingsReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupEditSettings(context.Context, *GroupEditSettingsRequest) (*GroupEditSettingsReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, ErrNotImplemented
}

func (c *client) GroupMessageList(*GroupMessageListRequest, Instance_GroupMessageListServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicInit(Instance_GroupPubSubTopicInitServer) error {
	return ErrNotImplemented
}

func (c *client) GroupPubSubTopicSubscribe(*GroupPubSubTopicSubscribeRequest, Instance_GroupPubSubTopicSubscribeServer) error {
	return ErrNotImplemented
}
