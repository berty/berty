package bertyprotocol

import (
	"context"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"github.com/pkg/errors"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) GroupInfo(_ context.Context, req *bertytypes.GroupInfo_Request) (*bertytypes.GroupInfo_Reply, error) {
	var (
		g   *bertytypes.Group
		err error
	)

	switch {
	case req.GroupPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getGroupForPK(pk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	case req.ContactPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getContactGroup(pk)
		if err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}
	default:
		return nil, errcode.ErrInvalidInput
	}

	md, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	member, err := md.member.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := md.device.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertytypes.GroupInfo_Reply{
		Group:    g,
		MemberPK: member,
		DevicePK: device,
	}, nil
}

func (s *service) ActivateGroup(ctx context.Context, req *bertytypes.ActivateGroup_Request) (*bertytypes.ActivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	err = s.activateGroup(pk, req.LocalOnly)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &bertytypes.ActivateGroup_Reply{}, nil
}

func (s *service) DeactivateGroup(_ context.Context, req *bertytypes.DeactivateGroup_Request) (*bertytypes.DeactivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if err := s.deactivateGroup(pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &bertytypes.DeactivateGroup_Reply{}, nil
}

func (s *service) MonitorGroup(req *bertytypes.MonitorGroup_Request, srv ProtocolService_MonitorGroupServer) error {
	g, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrGroupMissing.Wrap(err)
	}

	topic := g.MessageStore().Address().String()

	sub, err := s.host.EventBus().Subscribe([]interface{}{
		new(ipfsutil.EvtPubSubTopic),
		new(tinder.EvtDriverMonitor),
	})
	if err != nil {
		return errors.Wrap(err, "unable to subscribe pubsub topic event")
	}

	// @FIXME(gfanton): cached found peers should be done inside driver monitor
	cachedFoundPeers := make(map[peer.ID]ipfsutil.Multiaddrs)
	for evt := range sub.Out() {
		var monitorEvent *bertytypes.MonitorGroup_EventMonitor

		switch e := evt.(type) {
		case ipfsutil.EvtPubSubTopic:
			if topic != "" && topic != e.Topic {
				continue
			}

			// handle this event
			monitorEvent = monitorHandlePubsubEvent(&e, s.host)
		case tinder.EvtDriverMonitor:
			// skip if we are filtering by topic
			if topic != "" && topic != e.Topic {
				continue
			}

			// check if we already know this peer in case of found peer
			newMS := ipfsutil.NewMultiaddrs(e.AddrInfo.Addrs)
			if ms, ok := cachedFoundPeers[e.AddrInfo.ID]; ok {
				if ipfsutil.MultiaddrIsEqual(ms, newMS) {
					continue
				}
			}

			cachedFoundPeers[e.AddrInfo.ID] = newMS
			monitorEvent = monitorHandleDiscoveryEvent(&e, s.host)
		default:
			monitorEvent = &bertytypes.MonitorGroup_EventMonitor{
				Type: bertytypes.TypeEventMonitorUndefined,
			}
		}

		err := srv.Send(&bertytypes.MonitorGroup_Reply{
			GroupPK: req.GetGroupPK(),
			Event:   monitorEvent,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func monitorHandlePubsubEvent(e *ipfsutil.EvtPubSubTopic, h host.Host) *bertytypes.MonitorGroup_EventMonitor {
	var m bertytypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case ipfsutil.TypeEventMonitorPeerJoined:
		m.Type = bertytypes.TypeEventMonitorPeerJoin
		m.PeerJoin = &bertytypes.MonitorGroup_EventMonitorPeerJoin{}

		activeConns := h.Network().ConnsToPeer(e.PeerID)
		m.PeerJoin.Topic = e.Topic
		m.PeerJoin.PeerID = e.PeerID.String()
		m.PeerJoin.IsSelf = e.PeerID == h.ID()
		m.PeerJoin.Maddrs = make([]string, len(activeConns))
		for i, conn := range activeConns {
			m.PeerJoin.Maddrs[i] = conn.RemoteMultiaddr().String()
		}

	case ipfsutil.TypeEventMonitorPeerLeaved:
		m.Type = bertytypes.TypeEventMonitorPeerLeave
		m.PeerLeave = &bertytypes.MonitorGroup_EventMonitorPeerLeave{}

		m.PeerLeave.PeerID = e.PeerID.String()
		m.PeerLeave.IsSelf = e.PeerID == h.ID()
		m.PeerLeave.Topic = e.Topic

	default:
		m.Type = bertytypes.TypeEventMonitorUndefined
	}

	return &m
}

func monitorHandleDiscoveryEvent(e *tinder.EvtDriverMonitor, _ host.Host) *bertytypes.MonitorGroup_EventMonitor {
	var m bertytypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case tinder.TypeEventMonitorAdvertise:
		m.Type = bertytypes.TypeEventMonitorAdvertiseGroup
		m.AdvertiseGroup = &bertytypes.MonitorGroup_EventMonitorAdvertiseGroup{}

		m.AdvertiseGroup.Topic = e.Topic
		m.AdvertiseGroup.PeerID = e.AddrInfo.ID.String()
		m.AdvertiseGroup.DriverName = e.DriverName
		m.AdvertiseGroup.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.AdvertiseGroup.Maddrs[i] = addr.String()
		}

	case tinder.TypeEventMonitorFoundPeer:
		m.Type = bertytypes.TypeEventMonitorPeerFound
		m.PeerFound = &bertytypes.MonitorGroup_EventMonitorPeerFound{}

		m.PeerFound.Topic = e.Topic
		m.PeerFound.PeerID = e.AddrInfo.ID.String()
		m.PeerFound.DriverName = e.DriverName
		m.PeerFound.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.PeerFound.Maddrs[i] = addr.String()
		}

	default:
		m.Type = bertytypes.TypeEventMonitorUndefined
	}

	return &m
}
