package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
)

func (p *Peer) GetInvite(groupName string) (invite *messengertypes.ShareableBertyGroup_Reply, err error) {
	ctx := context.Background()

	resCreate, err := p.Protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return nil, err
	}

	invite, err = p.Messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   resCreate.GroupPK,
		GroupName: groupName,
	})

	if err != nil {
		return nil, err
	}

	// add group to peers' groups
	p.Lock.Lock()
	p.Groups[groupName] = invite.Link.GetBertyGroup().Group
	p.Lock.Unlock()

	return invite, err
}

func (p *Peer) JoinInvite(invite *messengertypes.ShareableBertyGroup_Reply, groupName string) (err error) {
	link := invite.GetLink()

	_, err = p.Protocol.MultiMemberGroupJoin(context.Background(), &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.GetBertyGroup().GetGroup(),
	})
	if err != nil {
		return err
	}

	// add group to peers' groups
	p.Lock.Lock()
	p.Groups[groupName] = invite.Link.GetBertyGroup().Group
	p.Lock.Unlock()

	return err
}

func (p *Peer) ListGroupMembers(groupName string) (s []string, err error) {
	reply, err := p.Protocol.DebugGroup(context.Background(), &protocoltypes.DebugGroup_Request{GroupPK: p.Groups[groupName].PublicKey})
	if err != nil {
		return s, err
	}

	fmt.Println(reply.PeerIDs)

	for _, peer := range reply.PeerIDs {
		fmt.Println(peer)
	}

	return s, err
}
