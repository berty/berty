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

	err := d.StreamEvent(StreamEvent_TypeInteractionUpdated, &StreamEvent_InteractionUpdated{})
	errs := multierr.Errors(err)
	require.True(t, called)
	require.Equal(t, len(errs), 1)
	require.Equal(t, errs[0].Error(), errStr)
}
