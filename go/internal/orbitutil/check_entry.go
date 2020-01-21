package orbitutil

import (
	"github.com/golang/protobuf/proto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

func groupAddMemberDeviceValidator(*bertyprotocol.GroupMetadata, proto.Message, *group.Group) error {
	return nil
}

func knownDeviceValidator(*bertyprotocol.GroupMetadata, proto.Message, *group.Group) error {
	return nil
}

func knownAdminDeviceValidator(*bertyprotocol.GroupMetadata, proto.Message, *group.Group) error {
	return nil
}

func groupSignedValidator(*bertyprotocol.GroupMetadata, proto.Message, *group.Group) error {
	return nil
}

var eventTypesMapper = map[bertyprotocol.EventType]struct {
	Message   proto.Message
	Validator func(*bertyprotocol.GroupMetadata, proto.Message, *group.Group) error
}{
	bertyprotocol.EventTypeGroupMemberDeviceAdded:                 {Message: &bertyprotocol.GroupAddMemberDevice{}, Validator: groupAddMemberDeviceValidator},
	bertyprotocol.EventTypeGroupDeviceSecretAdded:                 {Message: &bertyprotocol.GroupAddDeviceSecret{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountGroupJoined:                     {Message: &bertyprotocol.AccountGroupJoined{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountGroupLeft:                       {Message: &bertyprotocol.AccountGroupLeft{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestDisabled:          {Message: &bertyprotocol.AccountContactRequestDisabled{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestEnabled:           {Message: &bertyprotocol.AccountContactRequestEnabled{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestReferenceReset:    {Message: &bertyprotocol.AccountContactRequestReferenceReset{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestOutgoingEnqueued:  {Message: &bertyprotocol.AccountContactRequestEnqueued{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestOutgoingSent:      {Message: &bertyprotocol.AccountContactRequestSent{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestIncomingReceived:  {Message: &bertyprotocol.AccountContactRequestReceived{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestIncomingDiscarded: {Message: &bertyprotocol.AccountContactRequestDiscarded{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactRequestIncomingAccepted:  {Message: &bertyprotocol.AccountContactRequestAccepted{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactBlocked:                  {Message: &bertyprotocol.AccountContactBlocked{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeAccountContactUnblocked:                {Message: &bertyprotocol.AccountContactUnblocked{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeContactAliasKeyAdded:                   {Message: &bertyprotocol.ContactAddAliasKey{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeMultiMemberGroupAliasResolverAdded:     {Message: &bertyprotocol.MultiMemberGroupAddAliasResolver{}, Validator: knownDeviceValidator},
	bertyprotocol.EventTypeMultiMemberGroupInitialMemberAnnounced: {Message: &bertyprotocol.MultiMemberInitialMember{}, Validator: groupSignedValidator},
	bertyprotocol.EventTypeMultiMemberGroupAdminRoleGranted:       {Message: &bertyprotocol.MultiMemberGrantAdminRole{}, Validator: knownAdminDeviceValidator},
	bertyprotocol.EventTypeGroupMetadataPayloadSent:               {Message: &bertyprotocol.AppMetadata{}, Validator: knownDeviceValidator},
}
