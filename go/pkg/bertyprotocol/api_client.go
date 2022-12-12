package bertyprotocol

import (
	"context"
	"io"
	"sync"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) InstanceExportData(_ *protocoltypes.InstanceExportData_Request, server protocoltypes.ProtocolService_InstanceExportDataServer) (err error) {
	ctx, _, endSection := tyber.Section(server.Context(), s.logger, "Exporting protocol instance data")
	defer func() { endSection(err, "") }()

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

			if err := server.Send(&protocoltypes.InstanceExportData_Reply{ExportedData: contents[:l]}); err != nil {
				exportErr = errcode.ErrStreamWrite.Wrap(err)
				break
			}
		}
	}()

	if err := s.export(ctx, w); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}
	_ = w.Close()

	wg.Wait()

	if exportErr != nil {
		return exportErr
	}

	return nil
}

func (s *service) InstanceGetConfiguration(ctx context.Context, req *protocoltypes.InstanceGetConfiguration_Request) (*protocoltypes.InstanceGetConfiguration_Reply, error) {
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

	accountGroup := s.getAccountGroup()
	if accountGroup == nil {
		return nil, errcode.ErrGroupMissing
	}

	member, err := accountGroup.MemberPubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := accountGroup.DevicePubKey().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &protocoltypes.InstanceGetConfiguration_Reply{
		AccountPK:        member,
		DevicePK:         device,
		AccountGroupPK:   accountGroup.Group().PublicKey,
		PeerID:           key.ID().Pretty(),
		Listeners:        listeners,
		DevicePushToken:  accountGroup.metadataStore.getCurrentDevicePushToken(),
		DevicePushServer: accountGroup.metadataStore.getCurrentDevicePushServer(),
	}, nil
}
