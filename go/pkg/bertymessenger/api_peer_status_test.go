package bertymessenger

import (
	"context"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zaptest/observer"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

const peerStatusErrorLog = "error while getting GroupDeviceStatus from protocol"

// fakeDeviceStatusProtocol serves GroupDeviceStatus streams that fail with
// recvErr or, when recvErr is nil, end when their context is cancelled.
type fakeDeviceStatusProtocol struct {
	protocoltypes.ProtocolServiceClient

	recvErr error
	opened  atomic.Int32
}

func (f *fakeDeviceStatusProtocol) GroupDeviceStatus(ctx context.Context, _ *protocoltypes.GroupDeviceStatus_Request, _ ...grpc.CallOption) (grpc.ServerStreamingClient[protocoltypes.GroupDeviceStatus_Reply], error) {
	f.opened.Add(1)
	return &fakeDeviceStatusStream{ctx: ctx, err: f.recvErr}, nil
}

type fakeDeviceStatusStream struct {
	grpc.ClientStream

	ctx context.Context
	err error
}

func (s *fakeDeviceStatusStream) Recv() (*protocoltypes.GroupDeviceStatus_Reply, error) {
	if s.err != nil {
		return nil, s.err
	}
	<-s.ctx.Done()
	return nil, status.Error(codes.Canceled, s.ctx.Err().Error())
}

func newPeerStatusTestService(t *testing.T, protocol protocoltypes.ProtocolServiceClient) (*service, *observer.ObservedLogs) {
	t.Helper()

	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)

	core, logs := observer.New(zap.ErrorLevel)
	return &service{
		ctx:               ctx,
		logger:            zap.New(core),
		protocolClient:    protocol,
		cancelGroupStatus: make(map[string]*groupStatusMonitor),
		knownPeers:        make(map[string]protocoltypes.GroupDeviceStatus_Type),
	}, logs
}

func runningPeerStatusMonitors(svc *service) int {
	svc.muCancelGroupStatus.Lock()
	defer svc.muCancelGroupStatus.Unlock()

	return len(svc.cancelGroupStatus)
}

func TestMonitorGroupPeersStatusRestartsAfterStreamError(t *testing.T) {
	protocol := &fakeDeviceStatusProtocol{recvErr: status.Error(codes.Unavailable, "connection lost")}
	svc, logs := newPeerStatusTestService(t, protocol)
	groupPK := messengerutil.B64EncodeBytes([]byte("group"))

	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))

	// the failed monitor releases its entry and reports the error
	require.Eventually(t, func() bool { return runningPeerStatusMonitors(svc) == 0 }, time.Second, 5*time.Millisecond)
	require.Equal(t, 1, logs.FilterMessage(peerStatusErrorLog).Len())

	// so the next open starts a new monitor
	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))
	require.Equal(t, int32(2), protocol.opened.Load())
}

func TestStopMonitorGroupPeersStatus(t *testing.T) {
	protocol := &fakeDeviceStatusProtocol{}
	svc, logs := newPeerStatusTestService(t, protocol)
	groupPK := messengerutil.B64EncodeBytes([]byte("group"))

	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))
	require.Equal(t, 1, runningPeerStatusMonitors(svc))

	svc.stopMonitorGroupPeersStatus(groupPK)
	require.Equal(t, 0, runningPeerStatusMonitors(svc))

	// reopen right away, before the stopped monitor has finished exiting
	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))
	require.Equal(t, int32(2), protocol.opened.Load())

	// the stopped monitor must neither remove the new monitor's entry nor
	// report its cancellation as an error
	require.Never(t, func() bool {
		return runningPeerStatusMonitors(svc) != 1 || logs.Len() > 0
	}, 200*time.Millisecond, 5*time.Millisecond)
}

func TestMonitorGroupPeersStatusAlreadyRunning(t *testing.T) {
	protocol := &fakeDeviceStatusProtocol{}
	svc, _ := newPeerStatusTestService(t, protocol)
	groupPK := messengerutil.B64EncodeBytes([]byte("group"))

	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))
	require.NoError(t, svc.monitorGroupPeersStatus(groupPK))

	require.Equal(t, int32(1), protocol.opened.Load())
	require.Equal(t, 1, runningPeerStatusMonitors(svc))
}
