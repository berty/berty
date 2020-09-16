package bertymessenger

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/multierr"
)

func TestDispatcher(t *testing.T) {
	d := NewDispatcher()

	called := false
	var n NotifieeBundle
	const errStr = "Test error"
	n.StreamEventImpl = func(*StreamEvent) error {
		called = true
		return errors.New(errStr)
	}
	d.Register(&n)
	defer d.Unregister(&n)

	err := d.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{})
	errs := multierr.Errors(err)
	require.True(t, called)
	require.Equal(t, len(errs), 1)
	require.Equal(t, errs[0].Error(), errStr)

	d.Unregister(&n)
	require.Empty(t, d.notifiees)
}

func TestNotify(t *testing.T) {
	const errStr = "Test error"
	const notifType StreamEvent_Notified_Type = StreamEvent_Notified_TypeBasic
	const title string = "title"
	const body string = "body"

	d := NewDispatcher()

	// register handler
	var se *StreamEvent
	{
		var n NotifieeBundle
		n.StreamEventImpl = func(e *StreamEvent) error {
			se = e
			return errors.New(errStr)
		}
		d.Register(&n)
		defer d.Unregister(&n)
	}

	// trigger notif
	{
		err := d.Notify(notifType, title, body, nil)
		errs := multierr.Errors(err)
		require.Equal(t, len(errs), 1)
		require.Equal(t, errs[0].Error(), errStr)
	}

	// parse event
	var notif *StreamEvent_Notified
	{
		require.NotNil(t, se)
		require.Equal(t, StreamEvent_TypeNotified, se.GetType())
		sePayload, err := se.UnmarshalPayload()
		require.NoError(t, err)
		notif = sePayload.(*StreamEvent_Notified)
	}

	// verify notif
	{
		require.Equal(t, notifType, notif.GetType())
		require.Equal(t, title, notif.GetTitle())
		require.Equal(t, body, notif.GetBody())
		require.Empty(t, notif.GetPayload())
	}
}

func TestNotifyWithPayload(t *testing.T) {
	const title string = "title"
	const body string = "body"
	const errStr = "Test error"
	const notifType StreamEvent_Notified_Type = StreamEvent_Notified_TypeMessageReceived
	conv := Conversation{DisplayName: "conv"}

	d := NewDispatcher()

	// register handler
	var se *StreamEvent
	{
		var n NotifieeBundle
		n.StreamEventImpl = func(e *StreamEvent) error {
			se = e
			return errors.New(errStr)
		}
		d.Register(&n)
		defer d.Unregister(&n)
	}

	// trigger notif with payload
	{
		err := d.Notify(notifType, title, body, &StreamEvent_Notified_MessageReceived{Conversation: &conv})
		errs := multierr.Errors(err)
		require.Equal(t, len(errs), 1)
		require.Equal(t, errs[0].Error(), errStr)
	}

	// parse event
	var notif *StreamEvent_Notified
	{
		require.NotNil(t, se)
		require.Equal(t, StreamEvent_TypeNotified, se.GetType())
		sePayload, err := se.UnmarshalPayload()
		require.NoError(t, err)
		notif = sePayload.(*StreamEvent_Notified)
	}

	// verify notif
	{
		require.Equal(t, notifType, notif.GetType())
		require.Equal(t, title, notif.GetTitle())
		require.Equal(t, body, notif.GetBody())
	}

	// parse and verify payload
	{
		notifPayload, err := notif.UnmarshalPayload()
		require.NoError(t, err)
		msgRecvd := notifPayload.(*StreamEvent_Notified_MessageReceived)

		require.Equal(t, conv.DisplayName, msgRecvd.GetConversation().GetDisplayName())
	}
}
