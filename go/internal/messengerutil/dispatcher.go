package messengerutil

import (
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/pkg/errcode"
	mt "berty.tech/berty/v2/go/pkg/messengertypes"
)

type Dispatcher interface {
	StreamEvent(typ mt.StreamEvent_Type, msg proto.Message, isNew bool) error
	Notify(typ mt.StreamEvent_Notified_Type, title, body string, msg proto.Message) error
	IsEnabled() bool
}

type AugmentedInteractionFetcher interface {
	GetAugmentedInteraction(cid string) (*mt.Interaction, error)
}

func StreamInteraction(dispatcher Dispatcher, db AugmentedInteractionFetcher, cid string, isNew bool) error {
	interaction, err := db.GetAugmentedInteraction(cid)
	if err != nil {
		return errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	if err := dispatcher.StreamEvent(
		mt.StreamEvent_TypeInteractionUpdated,
		&mt.StreamEvent_InteractionUpdated{Interaction: interaction},
		isNew,
	); err != nil {
		return errcode.ErrCode_ErrMessengerStreamEvent.Wrap(err)
	}

	return nil
}

type NoopDispatcher struct{}

//nolint:revive
func (*NoopDispatcher) StreamEvent(typ mt.StreamEvent_Type, msg proto.Message, isNew bool) error {
	return nil
}

//nolint:revive
func (*NoopDispatcher) Notify(typ mt.StreamEvent_Notified_Type, title, body string, msg proto.Message) error {
	return nil
}

func (*NoopDispatcher) IsEnabled() bool {
	return false
}
