package orbitutilapi

import (
	ipfslog "berty.tech/go-ipfs-log"
	"github.com/ipfs/go-cid"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

type GroupSecretStoreEvent struct {
	GroupStoreEvent *bertyprotocol.GroupStoreEvent
}

func getParentsForCID(log ipfslog.Log, c cid.Cid) []cid.Cid {
	if log == nil {
		// TODO: this should not happen
		return []cid.Cid{}
	}

	parent, ok := log.GetEntries().Get(c.String())

	// Can't fetch parent entry
	if !ok {
		return []cid.Cid{}
	}

	nextEntries := parent.GetNext()

	// Parent has only one or no parents, returning its id
	if len(nextEntries) <= 1 {
		return []cid.Cid{parent.GetHash()}
	}

	// Parent has more than one parent, returning parent entries
	var ret []cid.Cid
	for _, n := range nextEntries {
		ret = append(ret, getParentsForCID(log, n)...)
	}

	return ret
}

func cidsAsBytes(cids []cid.Cid) [][]byte {
	cidsBytes := make([][]byte, len(cids))
	for i, c := range cids {
		cidsBytes[i] = c.Bytes()
	}

	return cidsBytes
}

func groupStoreEventFromEntry(log ipfslog.Log, e ipfslog.Entry, groupContext GroupContext) (*bertyprotocol.GroupStoreEvent, error) {
	var (
		err error
		ret bertyprotocol.GroupStoreEvent
	)

	ret.EventBase = &bertyprotocol.EventBase{
		ID:        e.GetHash().Bytes(),
		ParentIDs: cidsAsBytes(getParentsForCID(log, e.GetHash())), // TODO: if parent is a merge node we should return the next nodes of it
	}

	if ret.GroupPubKey, err = groupContext.GetGroup().PubKey.Raw(); err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &ret, nil
}

func NewGroupSecretStoreEvent(log ipfslog.Log, op ipfslog.Entry, payload *group.SecretEntryPayload, groupContext GroupContext) (*GroupSecretStoreEvent, error) {
	groupStoreEvent, err := groupStoreEventFromEntry(log, op, groupContext)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	groupStoreEvent.GroupDevicePubKey = payload.SenderDevicePubKey

	return &GroupSecretStoreEvent{
		GroupStoreEvent: groupStoreEvent,
	}, nil
}

func NewGroupMemberStoreEvent(log ipfslog.Log, op ipfslog.Entry, payload *group.MemberEntryPayload, groupContext GroupContext) (*bertyprotocol.GroupMemberStoreEvent, error) {
	groupStoreEvent, err := groupStoreEventFromEntry(log, op, groupContext)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	groupStoreEvent.GroupDevicePubKey = payload.MemberDevicePubKey
	groupStoreEvent.GroupMemberPubKey = payload.MemberPubKey

	return &bertyprotocol.GroupMemberStoreEvent{
		GroupStoreEvent: groupStoreEvent,
	}, nil
}

func NewGroupSettingStoreEvent(log ipfslog.Log, op ipfslog.Entry, payload *group.SettingEntryPayload, groupContext GroupContext) (*bertyprotocol.GroupSettingStoreEvent, error) {
	groupStoreEvent, err := groupStoreEventFromEntry(log, op, groupContext)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	groupStoreEvent.GroupMemberPubKey = payload.MemberPubKey

	return &bertyprotocol.GroupSettingStoreEvent{
		GroupStoreEvent: groupStoreEvent,
		Key:             payload.Key,
		Value:           payload.Value,
	}, nil
}
