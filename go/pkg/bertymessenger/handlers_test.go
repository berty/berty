package bertymessenger

import (
	"context"
	"testing"

	"github.com/stretchr/testify/require"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
)

type getEventHandlerForTestsOptions int

const (
	getEventHandlerForTestsWithService getEventHandlerForTestsOptions = iota
)

func getEventHandlerForTests(t *testing.T, opts ...getEventHandlerForTestsOptions) (*eventHandler, func()) {
	withService := false
	for _, o := range opts {
		if o == getEventHandlerForTestsWithService {
			withService = true
		}
	}

	ctx, cancel := context.WithCancel(context.Background())
	db, dispose := getInMemoryTestDB(t)

	protocolClient, protocolClientDispose := bertyprotocol.NewTestingProtocol(ctx, t, nil, nil)

	castedService := (*service)(nil)
	serviceDispose := func() {}

	if withService {
		var (
			s  = MessengerServiceServer(nil)
			ok = true
		)

		s, serviceDispose = TestingService(ctx, t, &TestingServiceOpts{
			Client: protocolClient.Client,
		})

		castedService, ok = s.(*service)
		require.True(t, ok)
	}

	handler := newEventHandler(ctx, db, protocolClient.Client, nil, castedService)

	return handler, func() {
		serviceDispose()
		protocolClientDispose()
		dispose()
		cancel()
	}
}

func Test_eventHandler_accountContactRequestIncomingAccepted(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_accountContactRequestIncomingReceived(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_accountContactRequestOutgoingEnqueued(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_accountContactRequestOutgoingSent(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_accountGroupJoined(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_accountServiceTokenAdded(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_contactRequestAccepted(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_dispatchVisibleInteraction(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_groupMemberDeviceAdded(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_groupMetadataPayloadSent(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleAppMessage(t *testing.T) {
	handler, dispose := getEventHandlerForTests(t)
	defer dispose()

	_ = handler

	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleAppMessageAcknowledge(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleAppMessageGroupInvitation(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleAppMessageSetUserName(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleAppMessageUserMessage(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_handleMetadataEvent(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_eventHandler_hydrateInteraction(t *testing.T) {
	// TODO
	t.Skip("TODO")
}

func Test_interactionFromAppMessage(t *testing.T) {
	// TODO
	t.Skip("TODO")
}
