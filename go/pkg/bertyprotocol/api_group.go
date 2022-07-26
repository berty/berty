package bertyprotocol

import (
	"context"
	"encoding/hex"
	"strings"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/host"
	peer "github.com/libp2p/go-libp2p-core/peer"
	manet "github.com/multiformats/go-multiaddr/net"
	"github.com/pkg/errors"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/tinder"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (s *service) GroupInfo(ctx context.Context, req *protocoltypes.GroupInfo_Request) (*protocoltypes.GroupInfo_Reply, error) {
	var (
		g   *protocoltypes.Group
		err error
	)

	switch {
	case req.GroupPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getGroupForPK(ctx, pk)
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

	member, err := md.PrivateMember().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := md.PrivateDevice().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &protocoltypes.GroupInfo_Reply{
		Group:    g,
		MemberPK: member,
		DevicePK: device,
	}, nil
}

func (s *service) ActivateGroup(ctx context.Context, req *protocoltypes.ActivateGroup_Request) (*protocoltypes.ActivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	err = s.activateGroup(ctx, pk, req.LocalOnly)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.ActivateGroup_Reply{}, nil
}

func (s *service) DeactivateGroup(_ context.Context, req *protocoltypes.DeactivateGroup_Request) (*protocoltypes.DeactivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if err := s.deactivateGroup(pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.DeactivateGroup_Reply{}, nil
}

func (s *service) GroupDeviceStatus(req *protocoltypes.GroupDeviceStatus_Request, srv protocoltypes.ProtocolService_GroupDeviceStatusServer) error {
	s.muGroupDeviceStatus.Lock()
	defer s.muGroupDeviceStatus.Unlock()

	// make a copy of statuses and send them
	statusCopy := make(map[string]*protocoltypes.GroupDeviceStatus_Reply)
	{
		if groupDeviceStatus, ok := s.groupDeviceStatus[hex.EncodeToString(req.GroupPK)]; ok {
			for id, status := range groupDeviceStatus {
				statusCopy[id] = status
				if err := srv.Send(status); err != nil {
					return err
				}
			}
		}
	}

	for {
		// wait until context is done or peer status cache is updated
		if ok := s.groupDeviceNotify.Wait(s.ctx); !ok {
			return errors.New("context canceled")
		}

		groupDeviceStatus, ok := s.groupDeviceStatus[hex.EncodeToString(req.GroupPK)]
		if ok {
			// check if there is an update for the group
			if diff := diffStatusMaps(statusCopy, groupDeviceStatus); len(diff) > 0 {
				for pid, status := range diff {
					if err := srv.Send(status); err != nil {
						return err
					}
					// update cache
					statusCopy[pid] = status
				}
			}
		}
	}
}

func diffStatusMaps(origin, updated map[string]*protocoltypes.GroupDeviceStatus_Reply) map[string]*protocoltypes.GroupDeviceStatus_Reply {
	diff := make(map[string]*protocoltypes.GroupDeviceStatus_Reply)

	for id, statusUpdated := range updated {
		if statusOrigin, found := origin[id]; found {
			if statusOrigin.Type != statusUpdated.Type {
				diff[id] = statusUpdated
			}
		} else {
			diff[id] = statusUpdated
		}
	}

	return diff
}

func (s *service) MonitorGroup(req *protocoltypes.MonitorGroup_Request, srv protocoltypes.ProtocolService_MonitorGroupServer) error {
	g, err := s.GetContextGroupForID(req.GroupPK)
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
		var monitorEvent *protocoltypes.MonitorGroup_EventMonitor

		switch e := evt.(type) {
		case ipfsutil.EvtPubSubTopic:
			// trim floodsub topic (if present)
			e.Topic = strings.TrimPrefix(e.Topic, "floodsub:")

			if topic != "" && topic != e.Topic {
				continue
			}

			// handle this event
			monitorEvent = monitorHandlePubsubEvent(&e, s.host)
		case tinder.EvtDriverMonitor:
			// trim floodsub topic (if present)
			e.Topic = strings.TrimPrefix(e.Topic, "floodsub:")

			s.logger.Debug("got topic", logutil.PrivateString("ns", e.Topic), logutil.PrivateString("ns to match", topic))
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
			monitorEvent = &protocoltypes.MonitorGroup_EventMonitor{
				Type: protocoltypes.TypeEventMonitorUndefined,
			}
		}

		// FIXME: @gfanton promised to do something about this part
		// _ = monitorEvent
		err := srv.Send(&protocoltypes.MonitorGroup_Reply{
			GroupPK: req.GetGroupPK(),
			Event:   monitorEvent,
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func monitorHandlePubsubEvent(e *ipfsutil.EvtPubSubTopic, h host.Host) *protocoltypes.MonitorGroup_EventMonitor {
	var m protocoltypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case ipfsutil.TypeEventMonitorPeerJoined:
		m.Type = protocoltypes.TypeEventMonitorPeerJoin
		m.PeerJoin = &protocoltypes.MonitorGroup_EventMonitorPeerJoin{}

		activeConns := h.Network().ConnsToPeer(e.PeerID)
		m.PeerJoin.Topic = e.Topic
		m.PeerJoin.PeerID = e.PeerID.String()
		m.PeerJoin.IsSelf = e.PeerID == h.ID()
		m.PeerJoin.Maddrs = make([]string, len(activeConns))
		for i, conn := range activeConns {
			m.PeerJoin.Maddrs[i] = conn.RemoteMultiaddr().String()
		}

	case ipfsutil.TypeEventMonitorPeerLeft:
		m.Type = protocoltypes.TypeEventMonitorPeerLeave
		m.PeerLeave = &protocoltypes.MonitorGroup_EventMonitorPeerLeave{}

		m.PeerLeave.PeerID = e.PeerID.String()
		m.PeerLeave.IsSelf = e.PeerID == h.ID()
		m.PeerLeave.Topic = e.Topic

	default:
		m.Type = protocoltypes.TypeEventMonitorUndefined
	}

	return &m
}

func monitorHandleDiscoveryEvent(e *tinder.EvtDriverMonitor, _ host.Host) *protocoltypes.MonitorGroup_EventMonitor {
	var m protocoltypes.MonitorGroup_EventMonitor

	switch e.EventType {
	case tinder.TypeEventMonitorAdvertise, tinder.TypeEventMonitorDriverAdvertise:
		m.Type = protocoltypes.TypeEventMonitorAdvertiseGroup
		m.AdvertiseGroup = &protocoltypes.MonitorGroup_EventMonitorAdvertiseGroup{}

		m.AdvertiseGroup.Topic = e.Topic
		m.AdvertiseGroup.PeerID = e.AddrInfo.ID.String()
		m.AdvertiseGroup.DriverName = e.DriverName // empty if e == tinder.TypeEventMonitorAdvertise
		m.AdvertiseGroup.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.AdvertiseGroup.Maddrs[i] = addr.String()
		}

	case tinder.TypeEventMonitorFoundPeer, tinder.TypeEventMonitorDriverFoundPeer:
		m.Type = protocoltypes.TypeEventMonitorPeerFound
		m.PeerFound = &protocoltypes.MonitorGroup_EventMonitorPeerFound{}

		m.PeerFound.Topic = e.Topic
		m.PeerFound.PeerID = e.AddrInfo.ID.String()
		m.PeerFound.DriverName = e.DriverName // empty if e == tinder.TypeEventMonitorFoundPeer
		m.PeerFound.Maddrs = make([]string, len(e.AddrInfo.Addrs))
		for i, addr := range e.AddrInfo.Addrs {
			m.PeerFound.Maddrs[i] = addr.String()
		}

	default:
		m.Type = protocoltypes.TypeEventMonitorUndefined
	}

	return &m
}

func (s *service) monitorHandleGroupDeviceConnected(peer peer.ID) error {
	pdg, ok := s.odb.GetDevicePKForPeerID(peer)
	if !ok {
		return errors.New("PeerDeviceGroup unknown")
	}

	devicePKRaw, err := pdg.DevicePK.Raw()
	if err != nil {
		return errors.Wrap(err, "unable to get raw devicePK")
	}

	connected := protocoltypes.GroupDeviceStatus_Reply_PeerConnected{
		PeerID:   peer.Pretty(),
		DevicePK: devicePKRaw,
	}

	activeConns := s.host.Network().ConnsToPeer(peer)
	connected.Transports = make([]protocoltypes.GroupDeviceStatus_Transport, len(activeConns))
	connected.Maddrs = make([]string, len(activeConns))

CONN_LOOP:
	for i, conn := range activeConns {
		connected.Maddrs[i] = conn.RemoteMultiaddr().String()

		// check for proximity transport
		protocols := conn.RemoteMultiaddr().Protocols()
		for _, protocol := range protocols {
			switch protocol.Name {
			case "nearby", "mc", "ble":
				connected.Transports[i] = protocoltypes.TptProximity
				continue CONN_LOOP
			}
		}

		// otherwise, check for WAN/LAN addr
		if manet.IsPrivateAddr(conn.RemoteMultiaddr()) {
			connected.Transports[i] = protocoltypes.TptLAN
		} else {
			connected.Transports[i] = protocoltypes.TptWAN
		}
	}

	eventBytes, err := connected.Marshal()
	if err != nil {
		return err
	}

	status := &protocoltypes.GroupDeviceStatus_Reply{
		Type:  protocoltypes.TypePeerConnected,
		Event: eventBytes,
	}

	s.updateGroupDeviceStatus(pdg.Group, peer, status)

	return nil
}

func (s *service) monitorHandleGroupDeviceDisconnected(peer peer.ID) error {
	pdg, ok := s.odb.GetDevicePKForPeerID(peer)
	if !ok {
		return errors.New("PeerDeviceGroup unknown")
	}

	event := &protocoltypes.GroupDeviceStatus_Reply_PeerDisconnected{
		PeerID: peer.Pretty(),
	}
	eventBytes, err := event.Marshal()
	if err != nil {
		return err
	}

	status := &protocoltypes.GroupDeviceStatus_Reply{
		Type:  protocoltypes.TypePeerDisconnected,
		Event: eventBytes,
	}

	s.updateGroupDeviceStatus(pdg.Group, peer, status)

	return nil
}

func (s *service) updateGroupDeviceStatus(group *protocoltypes.Group, peer peer.ID, status *protocoltypes.GroupDeviceStatus_Reply) {
	s.muGroupDeviceStatus.Lock()
	defer s.muGroupDeviceStatus.Unlock()

	groupStatus, ok := s.groupDeviceStatus[group.GroupIDAsString()]
	if ok {
		if old, ok := groupStatus[peer.Pretty()]; ok {
			if old.Type == status.Type {
				return
			}
		}
	} else {
		groupStatus = make(map[string]*protocoltypes.GroupDeviceStatus_Reply)
		s.groupDeviceStatus[group.GroupIDAsString()] = groupStatus
	}

	groupStatus[peer.Pretty()] = status
	s.groupDeviceNotify.Broadcast()
}
