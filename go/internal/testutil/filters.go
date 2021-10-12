package testutil

import (
	"testing"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func TestFilterAppMetadata(t *testing.T, events <-chan *protocoltypes.GroupMetadataEvent) []*protocoltypes.AppMetadata {
	t.Helper()

	out := []*protocoltypes.AppMetadata(nil)

	for evt := range events {
		if evt == nil {
			continue
		}

		if evt.Metadata.EventType != protocoltypes.EventTypeGroupMetadataPayloadSent {
			continue
		}

		m := &protocoltypes.AppMetadata{}
		if err := m.Unmarshal(evt.Event); err != nil {
			continue
		}

		out = append(out, m)
	}

	return out
}
