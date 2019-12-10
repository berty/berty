package storemember

import (
	"berty.tech/go/internal/group"
)

type EventNewMemberDevice struct {
	MemberDevice *group.MemberDevice
}

func NewEventNewMemberDevice(md *group.MemberDevice) *EventNewMemberDevice {
	return &EventNewMemberDevice{
		MemberDevice: md,
	}
}
