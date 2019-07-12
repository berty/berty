package entity

import (
	time "time"

	errc "berty.tech/core/pkg/errorcodes"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var TrustedStatuses = []Contact_Status{
	Contact_IsTrustedFriend,
	Contact_IsFriend,
	Contact_Myself,
}

type ContactInteractor interface {
	Seen(time.Time) error
	Requested(time.Time) error
	RequestedMe(time.Time) error
	Accepted(time.Time) error
	AcceptedMe(time.Time) error

	IsMyself() bool
	IsSeen() bool
	IsRequested() bool
	DidRequestMe() bool
	IsFriend() bool
	IsTrustedFriend() bool
	IsBlocked() bool

	setRequested(time.Time)
	setRequestedMe(time.Time)
	setFriend(time.Time)

	Marshal() ([]byte, error)
	Unmarshal([]byte) error
}

var _ ContactInteractor = (*Contact)(nil)

func NewContact(id string, displayName string, status Contact_Status) (*Contact, error) {
	return &Contact{
		ID:          id,
		DisplayName: displayName,
		Status:      status,
		Devices:     []*Device{},
	}, nil
}

func (c *Contact) IsMyself() bool {
	return c.Status == Contact_Myself
}

func (c *Contact) setRequested(at time.Time) {
	c.Status = Contact_IsRequested
	c.MutatedAt = at.UTC()
}

func (c *Contact) setRequestedMe(at time.Time) {
	c.Status = Contact_RequestedMe
	c.MutatedAt = at.UTC()
}

func (c *Contact) setFriend(at time.Time) {
	c.Status = Contact_IsFriend
	c.MutatedAt = at.UTC()
}

func (c *Contact) Seen(at time.Time) error {
	if c.IsMyself() {
		return errc.ErrContactSeen.Wrap(errc.ErrContactStatusMyself.New())
	}
	if c.IsSeen() {
		return nil
	}
	c.SeenAt = at.UTC()
	return nil
}

func (c *Contact) Requested(at time.Time) error {
	if c.IsMyself() {
		return errc.ErrContactReq.Wrap(errc.ErrContactStatusMyself.New())
	}
	if c.IsFriend() {
		return errc.ErrContactReq.Wrap(errc.ErrContactStatusIsFriend.New())
	}
	if c.DidRequestMe() {
		c.setFriend(at)
		return nil
	}
	c.setRequested(at)
	return nil
}

func (c *Contact) RequestedMe(at time.Time) error {
	if c.IsMyself() {
		return errc.ErrContactReqMe.Wrap(errc.ErrContactStatusMyself.New())
	}
	if c.IsFriend() {
		return errc.ErrContactReqMe.Wrap(errc.ErrContactStatusIsFriend.New())
	}
	if c.IsRequested() {
		c.setFriend(at)
		return nil
	}
	c.setRequestedMe(at)
	return nil
}

func (c *Contact) Accepted(at time.Time) error {
	if c.IsMyself() {
		return errc.ErrContactAccepted.Wrap(errc.ErrContactStatusMyself.New())
	}
	if !c.DidRequestMe() {
		return errc.ErrContactAccepted.Wrap(errc.ErrContactStatusReqMe.New())
	}
	if c.IsFriend() {
		return errc.ErrContactAccepted.Wrap(errc.ErrContactStatusIsFriend.New())
	}
	c.setFriend(at)
	return nil
}

func (c *Contact) AcceptedMe(at time.Time) error {
	if c.IsMyself() {
		return errc.ErrContactAcceptedMe.Wrap(errc.ErrContactStatusMyself.New())
	}
	if !c.IsRequested() {
		return errc.ErrContactAcceptedMe.Wrap(errc.ErrContactStatusIsRequested.New())
	}
	if c.IsFriend() {
		return errc.ErrContactAcceptedMe.Wrap(errc.ErrContactStatusIsFriend.New())
	}
	c.setFriend(at)
	return nil
}

func (c *Contact) IsSeen() bool {
	if c.SeenAt.Before(c.MutatedAt) {
		return false
	}
	return true
}

func (c *Contact) IsRequested() bool {
	return c.Status == Contact_IsRequested
}

func (c *Contact) DidRequestMe() bool {
	return c.Status == Contact_RequestedMe
}

func (c *Contact) IsFriend() bool {
	return c.Status == Contact_IsFriend || c.Status == Contact_IsTrustedFriend
}

func (c *Contact) IsTrustedFriend() bool {
	return c.Status == Contact_IsTrustedFriend
}

func (c *Contact) IsBlocked() bool {
	return c.Status == Contact_IsBlocked
}

func (c Contact) Filtered() *Contact {
	return &Contact{
		ID:            c.ID,
		DisplayName:   c.DisplayName,
		DisplayStatus: c.DisplayStatus,
		// FIXME: share sigchain
	}
}

func (c *Contact) WithPushInformation(db *gorm.DB) *Contact {
	contact := *c
	devices := []*Device{}

	if err := db.Model(Device{}).Find(&devices, &Device{ContactID: c.ID}).Error; err != nil {
		logger().Error("unable to fetch devices", zap.Error(err))
		return &contact
	}

	for i, device := range devices {
		devices[i] = device.Filtered().WithPushInformation(db)
	}

	contact.Devices = devices

	return &contact
}

func (c *Contact) IsTrusted() bool {
	for _, status := range TrustedStatuses {
		if c.Status == status {
			return true
		}
	}

	return false
}

func (c Contact) PeerID() string {
	return c.ID // FIXME: use sigchain
}
