package bertyprotocol

import (
	"context"
	"io"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) InstanceExportData(_ *bertytypes.InstanceExportData_Request, server ProtocolService_InstanceExportDataServer) error {
	r, w := io.Pipe()

	var exportErr error
	wg := sync.WaitGroup{}
	wg.Add(1)

	go func() {
		defer func() { _ = r.Close() }()
		defer wg.Done()

		for {
			contents := make([]byte, 4096)
			l, err := r.Read(contents)

			if err == io.EOF {
				break
			} else if err != nil {
				exportErr = errcode.ErrStreamRead.Wrap(err)
				break
			}

			if err := server.Send(&bertytypes.InstanceExportData_Reply{ExportedData: contents[:l]}); err != nil {
				exportErr = errcode.ErrStreamWrite.Wrap(err)
				break
			}
		}
	}()

	if err := s.export(server.Context(), w); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}
	_ = w.Close()

	wg.Wait()

	if exportErr != nil {
		return exportErr
	}

	return nil
}

func (s *service) InstanceGetConfiguration(ctx context.Context, req *bertytypes.InstanceGetConfiguration_Request) (*bertytypes.InstanceGetConfiguration_Reply, error) {
	key, err := s.ipfsCoreAPI.Key().Self(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	maddrs, err := s.ipfsCoreAPI.Swarm().ListenAddrs(ctx)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	listeners := make([]string, len(maddrs))
	for i, addr := range maddrs {
		listeners[i] = addr.String()
	}

	member, err := s.accountGroup.MemberPubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := s.accountGroup.DevicePubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertytypes.InstanceGetConfiguration_Reply{
		AccountPK:      member,
		DevicePK:       device,
		AccountGroupPK: s.accountGroup.Group().PublicKey,
		PeerID:         key.ID().Pretty(),
		Listeners:      listeners,
	}, nil
}
