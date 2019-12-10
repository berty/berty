package storemember

import (
	"berty.tech/berty/go/internal/group"
)

type EventNewMemberDevice struct {
	MemberDevice *group.MemberDevice
}

func NewEventNewMemberDevice(md *group.MemberDevice) *EventNewMemberDevice {
	return &EventNewMemberDevice{
		MemberDevice: md,
	}
}
