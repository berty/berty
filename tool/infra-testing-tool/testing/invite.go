package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
)

func (p *Peer) GetInvite(groupName string) (invite *messengertypes.ShareableBertyGroup_Reply, err error) {
	ctx := context.Background()

	protocol := protocoltypes.NewProtocolServiceClient(p.Cc)
	messenger := messengertypes.NewMessengerServiceClient(p.Cc)

	resCreate, err := protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return nil, err
	}

	invite, err = messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   resCreate.GroupPK,
		GroupName: groupName,
	})

	// add group to peers' groups
	p.Groups[groupName] = resCreate.GroupPK

	return invite, err
}

func (p *Peer) JoinInvite(invite *messengertypes.ShareableBertyGroup_Reply, groupName string) (err error) {
	link := invite.GetLink()

	protocol := protocoltypes.NewProtocolServiceClient(p.Cc)

	_, err = protocol.MultiMemberGroupJoin(context.Background(), &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.GetBertyGroup().GetGroup(),
	})
	if err != nil {
		return err
	}

	// add group to peers' groups
	p.Groups[groupName] = link.GetBertyGroup().Group.PublicKey
	return err
}
