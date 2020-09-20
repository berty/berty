package bertyprotocol

import (
	"context"
	"fmt"
	"os"
	"runtime"
	"syscall"

	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/multierr"
	"go.uber.org/zap"
	"moul.io/godev"
	"moul.io/openfiles"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/stores/operation"
)

func (s *service) DebugListGroups(req *bertytypes.DebugListGroups_Request, srv ProtocolService_DebugListGroupsServer) error {
	if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
		GroupPK:   s.accountGroup.group.PublicKey,
		GroupType: s.accountGroup.group.GroupType,
	}); err != nil {
		return err
	}

	for _, c := range s.accountGroup.MetadataStore().ListContactsByStatus(bertytypes.ContactStateAdded) {
		pk, err := crypto.UnmarshalEd25519PublicKey(c.PK)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := getGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
			ContactPK: c.PK,
		}); err != nil {
			return err
		}
	}

	for _, g := range s.accountGroup.MetadataStore().ListMultiMemberGroups() {
		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
		}); err != nil {
			return err
		}
	}

	return nil
}

func (s *service) DebugInspectGroupStore(req *bertytypes.DebugInspectGroupStore_Request, srv ProtocolService_DebugInspectGroupStoreServer) error {
	if req.LogType == bertytypes.DebugInspectGroupLogTypeUndefined {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid log type specified"))
	}

	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	switch req.LogType {
	case bertytypes.DebugInspectGroupLogTypeMessage:
		for _, e := range cg.messageStore.OpLog().GetEntries().Slice() {
			var (
				payload  = []byte(nil)
				devicePK = []byte(nil)
				nexts    = make([][]byte, len(e.GetNext()))
			)

			if evt, err := cg.messageStore.openMessage(srv.Context(), e); err != nil {
				s.logger.Error("unable to open message", zap.Error(err))
			} else {
				devicePK = evt.Headers.DevicePK
				payload = evt.Message
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:        e.GetHash().Bytes(),
				ParentCIDs: nexts,
				DevicePK:   devicePK,
				Payload:    payload,
			}); err != nil {
				return err
			}
		}

	case bertytypes.DebugInspectGroupLogTypeMetadata:
		log := cg.metadataStore.OpLog()

		for _, e := range log.GetEntries().Slice() {
			var (
				eventType bertytypes.EventType
				payload   = []byte(nil)
				devicePK  = []byte(nil)
				nexts     = make([][]byte, len(e.GetNext()))
			)

			if op, err := operation.ParseOperation(e); err != nil {
				s.logger.Error("unable to parse operation", zap.Error(err))
			} else if meta, event, err := openGroupEnvelope(cg.group, op.GetValue()); err != nil {
				s.logger.Error("unable to open group envelope", zap.Error(err))
			} else if metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, cg.group); err != nil {
				s.logger.Error("unable to get group metadata event from entry", zap.Error(err))
			} else {
				payload = metaEvent.Event
				eventType = metaEvent.Metadata.EventType

				if typeData, ok := eventTypesMapper[metaEvent.Metadata.EventType]; ok {
					p := proto.Clone(typeData.Message)
					if err := proto.Unmarshal(metaEvent.Event, p); err == nil {
						if msg, ok := p.(eventDeviceSigned); ok {
							devicePK = msg.GetDevicePK()
						}
					}
				} else {
					s.logger.Error("unable to get message struct for event type", zap.String("event_type", metaEvent.Metadata.EventType.String()))
				}
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:               e.GetHash().Bytes(),
				ParentCIDs:        nexts,
				Payload:           payload,
				MetadataEventType: eventType,
				DevicePK:          devicePK,
			}); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *service) DebugGroup(ctx context.Context, request *bertytypes.DebugGroup_Request) (*bertytypes.DebugGroup_Reply, error) {
	rep := &bertytypes.DebugGroup_Reply{}

	peers, err := s.ipfsCoreAPI.Swarm().Peers(ctx)
	if err != nil {
		return nil, err
	}

	topic := fmt.Sprintf("grp_%s", string(request.GroupPK))

	for _, p := range peers {
		tagInfo := s.ipfsCoreAPI.ConnMgr().GetTagInfo(p.ID())
		if _, ok := tagInfo.Tags[topic]; ok {
			rep.PeerIDs = append(rep.PeerIDs, p.ID().String())
		}
	}

	return rep, nil
}

func SystemInfoProcess() (*bertytypes.SystemInfo_Process, error) {
	var errs error

	// rlimit
	rlimitNofile := syscall.Rlimit{}
	err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rlimitNofile)
	errs = multierr.Append(errs, err)

	// rusage
	selfUsage := syscall.Rusage{}
	err = syscall.Getrusage(syscall.RUSAGE_SELF, &selfUsage)
	errs = multierr.Append(errs, err)
	childrenUsage := syscall.Rusage{}
	err = syscall.Getrusage(syscall.RUSAGE_CHILDREN, &childrenUsage)
	errs = multierr.Append(errs, err)

	// openfiles
	nofile, nofileErr := openfiles.Count()
	errs = multierr.Append(errs, nofileErr)

	// hostname
	hn, err := os.Hostname()
	errs = multierr.Append(errs, err)

	// process priority
	prio, err := syscall.Getpriority(syscall.PRIO_PROCESS, 0)
	errs = multierr.Append(errs, err)

	// working dir
	wd, err := syscall.Getwd()
	errs = multierr.Append(errs, err)

	reply := bertytypes.SystemInfo_Process{
		SelfRusage:       godev.JSON(selfUsage),
		ChildrenRusage:   godev.JSON(childrenUsage),
		RlimitCur:        rlimitNofile.Cur,
		Nofile:           nofile,
		TooManyOpenFiles: openfiles.IsTooManyError(nofileErr),
		NumCPU:           int64(runtime.NumCPU()),
		GoVersion:        runtime.Version(),
		HostName:         hn,
		NumGoroutine:     int64(runtime.NumGoroutine()),
		OperatingSystem:  runtime.GOOS,
		Arch:             runtime.GOARCH,
		Version:          bertyversion.Version,
		VcsRef:           bertyversion.VcsRef,
		RlimitMax:        rlimitNofile.Max,
		Priority:         int64(prio),
		PID:              int64(syscall.Getpid()),
		UID:              int64(syscall.Getuid()),
		PPID:             int64(syscall.Getppid()),
		WorkingDir:       wd,
	}

	return &reply, errs
}

func (s *service) SystemInfo(ctx context.Context, request *bertytypes.SystemInfo_Request) (*bertytypes.SystemInfo_Reply, error) {
	reply := bertytypes.SystemInfo_Reply{}

	// process
	process, errs := SystemInfoProcess()
	reply.Process = process
	reply.Process.StartedAt = s.startedAt.Unix()

	// gRPC
	// TODO

	// p2p
	{
		reply.P2P = &bertytypes.SystemInfo_P2P{}

		// swarm metrics
		if api := s.IpfsCoreAPI(); api != nil {
			peers, err := api.Swarm().Peers(ctx)
			reply.P2P.ConnectedPeers = int64(len(peers))
			errs = multierr.Append(errs, err)
		} else {
			errs = multierr.Append(errs, fmt.Errorf("no such IPFS core API"))
		}

		// pubsub metrics
		// TODO

		// BLE metrics
	}

	// OrbitDB
	status := s.accountGroup.metadataStore.ReplicationStatus()
	reply.OrbitDB = &bertytypes.SystemInfo_OrbitDB{
		AccountMetadata: &bertytypes.SystemInfo_OrbitDB_ReplicationStatus{
			Progress: int64(status.GetProgress()),
			Maximum:  int64(status.GetMax()),
			Buffered: int64(status.GetBuffered()),
			Queued:   int64(status.GetQueued()),
		},
	}
	// FIXME: compute more stores

	// warns
	if errs != nil {
		reply.Warns = []string{}
		for _, err := range multierr.Errors(errs) {
			reply.Warns = append(reply.Warns, err.Error())
		}
	}

	return &reply, nil
}
