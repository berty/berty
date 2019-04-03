package entity

import (
	fmt "fmt"
	"sort"
	"strings"
	time "time"

	"berty.tech/core/pkg/errorcodes"
	"github.com/gofrs/uuid"
)

type ConversationInteractor interface {
	IsOneToOne() bool
	IsGroup() bool

	IsFull() bool

	IsMember(contactID string) bool

	GetMember(contactID string) (ConversationMemberInteractor, error)

	GetOwners() []ConversationMemberInteractor

	GetComputedTitle() string

	Marshal() ([]byte, error)
	Unmarshal([]byte) error
}

var _ ConversationInteractor = (*Conversation)(nil)

func NewOneToOneConversation(a *Contact, b *Contact) (*Conversation, error) {
	c := &Conversation{
		ID:      GetOneToOneID(a, b),
		Kind:    Conversation_OneToOne,
		Members: []*ConversationMember{},
	}

	// create the first member
	ma, err := newConversationMember(a, c)
	if err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}
	mb, err := newConversationMember(b, c)
	if err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}

	c.Members = append(c.Members, ma, mb)

	im, err := c.GetMember(ma.GetContactID())
	if err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}

	// set the two contacts as owners
	if err := im.SetOwner(a.ID); err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}
	if err := im.SetOwner(b.ID); err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}

	return c, nil
}

func NewGroupConversation(contacts []*Contact) (*Conversation, error) {
	var err error
	c := &Conversation{
		ID:      uuid.Must(uuid.NewV4()).String(),
		Kind:    Conversation_Group,
		Members: []*ConversationMember{},
	}

	// get myself from contacts
	var myself *Contact
	for _, contact := range contacts {
		if contact.Status == Contact_Myself {
			myself = contact
		}
	}
	if myself == nil {
		return nil, errorcodes.ErrConversation.Wrap(
			errorcodes.ErrConversationMembers.New(),
		)
	}

	// add myself as converastion member
	mm, err := newConversationMember(myself, c)
	if err != nil {
		return nil, errorcodes.ErrConversation.Wrap(err)
	}
	c.Members = append(c.Members, mm)

	// get interactive member
	im, err := c.GetMember(myself.ID)
	if err != nil {
		return nil, err
	}

	// invite the contacts
	for _, contact := range contacts {
		// create the member
		if contact.ID == myself.ID {
			continue
		}
		if err := im.Invite(contact); err != nil {
			return nil, err
		}
	}

	// set myself as owner
	if err = im.SetOwner(myself.ID); err != nil {
		return nil, err
	}

	return c, nil
}

func (c *Conversation) IsOneToOne() bool {
	if c.Kind != Conversation_OneToOne {
		return false
	}

	if len(c.Members) != 2 {
		return false
	}

	// OneToOne ID should always be the same
	id := GetOneToOneID(c.Members[0].Contact, c.Members[1].Contact)
	if id != c.ID {
		return false
	}

	return true
}

func GetOneToOneID(a, b *Contact) string {
	contacts := []*Contact{a, b}
	sort.SliceStable(contacts, func(i, j int) bool {
		if strings.Compare(contacts[i].ID, contacts[j].ID) > 0 {
			return false
		}
		return true
	})
	return contacts[0].ID + ":" + contacts[1].ID
}

func (c *Conversation) IsGroup() bool {
	if c.Kind != Conversation_Group {
		return false
	}
	return true
}

// GetMember returns a member that can interact with conversation
func (c *Conversation) GetMember(contactID string) (ConversationMemberInteractor, error) {
	for _, member := range c.Members {
		if member.ContactID == contactID {
			return &conversationMember{
				ConversationMember: member,
				conversation:       c,
			}, nil
		}
	}
	return nil, errorcodes.ErrConversationGetMember.Wrap(
		errorcodes.ErrConversationMembers.Wrap(
			errorcodes.ErrConversationMemberContactID.New(),
		),
	)
}

func (c *Conversation) GetOwners() []ConversationMemberInteractor {
	owners := []ConversationMemberInteractor{}
	for _, member := range c.Members {
		if member.Status == ConversationMember_Owner {
			owners = append(owners, &conversationMember{
				ConversationMember: member,
				conversation:       c,
			})
		}
	}
	return owners
}

func (c *Conversation) IsMember(contactID string) bool {
	for _, member := range c.Members {
		if contactID == member.ContactID {
			return true
		}
	}
	return false
}

func (c *Conversation) IsFull() bool {
	if c.IsOneToOne() && len(c.Members) == 2 {
		return true
	}
	return false
}

func (c *Conversation) GetComputedTitle() string {
	if c.Title == "" {
		return c.Title
	}
	title := ""
	i := 0
	for _, member := range c.Members {
		if member.Contact.Status == Contact_Myself {
			continue
		}
		if i == 0 {
			title = member.Contact.DisplayName
		} else if i == len(c.Members) {
			title = " and " + member.Contact.DisplayName
		} else if i > 2 {
			title = fmt.Sprintf(" and %+v others members", len(c.Members)-i)
		} else {
			title = ", " + member.Contact.DisplayName
		}
		i++
	}
	return title
}

func (c Conversation) Filtered() *Conversation {
	filteredMembers := []*ConversationMember{}
	for _, member := range c.Members {
		filteredMembers = append(filteredMembers, member.Filtered())
	}
	return &Conversation{
		ID:      c.ID,
		Title:   c.Title,
		Topic:   c.Topic,
		Kind:    c.Kind,
		ReadAt:  c.ReadAt,
		Members: filteredMembers,
	}
}

// Conversation Member takes actions on conversation
type ConversationMemberInteractor interface {
	Invite(contact *Contact) error
	Leave() error

	SetTitle(string) error
	SetTopic(string) error

	SetOwner(contactID string) error

	Block(contactID string) error
	Unblock(contactID string) error

	Read(time.Time) error
	Write(time.Time, *Message) error

	IsOwner() bool
	IsActive() bool
	IsBlocked() bool

	Marshal() ([]byte, error)
	Unmarshal([]byte) error

	GetContactID() string
	GetContact() *Contact
	GetConversationID() string
}

type conversationMember struct {
	*ConversationMember
	conversation *Conversation
}

var _ ConversationMemberInteractor = (*conversationMember)(nil)

func newConversationMember(contact *Contact, conversation *Conversation) (*ConversationMember, error) {
	m := &ConversationMember{
		ID:             conversation.ID + ":" + contact.ID,
		Status:         ConversationMember_Active,
		ContactID:      contact.ID,
		ConversationID: conversation.ID,
		Contact:        contact,
	}
	return m, nil
}

func (m *conversationMember) IsOwner() bool {
	if m.Status == ConversationMember_Owner {
		return true
	}

	// if conversation is 1 to 1, member is automatically owner
	if m.conversation.Kind == Conversation_OneToOne {
		return true
	}

	// if there is no member in conversation, member is automatically owner
	if len(m.conversation.Members) == 0 {
		return true
	}

	// if there is no owner, member is automatically owner
	if len(m.conversation.GetOwners()) == 0 {
		return true
	}

	return false
}

func (m *conversationMember) IsActive() bool {
	if m.Status == ConversationMember_Active || m.IsOwner() {
		return true
	}
	return false
}

func (m *conversationMember) IsBlocked() bool {
	if m.Status == ConversationMember_Blocked {
		return true
	}
	return false
}

func (m *conversationMember) Invite(contact *Contact) error {
	// check if member have the right to invite
	if !m.IsActive() {
		return errorcodes.ErrConversationMemberInvite.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	// check if contact is already a member
	if m.conversation.IsMember(contact.ID) {
		return nil
	}

	// check if we can add the member
	if m.conversation.IsFull() {
		return errorcodes.ErrConversationMemberInvite.Wrap(
			errorcodes.ErrConversationIsFull.New(),
		)
	}

	// then add the member
	cm, err := newConversationMember(contact, m.conversation)
	if err != nil {
		return errorcodes.ErrConversationMemberInvite.Wrap(err)
	}
	m.conversation.Members = append(m.conversation.Members, cm)
	return nil
}

func (m *conversationMember) Leave() error {
	// retrieve member in list and remove it
	for i, member := range m.conversation.Members {
		if m.ID == member.ID {
			m.conversation.Members = append(m.conversation.Members[:i], m.conversation.Members[i+1:]...)
			return nil
		}
	}

	return errorcodes.ErrConversationMemberLeave.Wrap(
		errorcodes.ErrConversationMembers.New(),
	)
}

func (m *conversationMember) SetTitle(title string) error {
	// check if member have the right to set the title
	if !m.IsOwner() {
		return errorcodes.ErrConversationMemberSetTitle.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	// check if the title is valid
	if title == "" {
		return errorcodes.ErrConversationMemberSetTitle.Wrap(
			errorcodes.ErrConversationTitle.New(),
		)
	}

	// then set the title
	m.conversation.Title = title
	return nil
}

func (m *conversationMember) SetTopic(topic string) error {
	// check if member have the right to set the topic
	if !m.IsOwner() {
		return errorcodes.ErrConversationMemberSetTopic.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	// then set the topic
	m.conversation.Topic = topic
	return nil
}

func (m *conversationMember) SetOwner(contactID string) error {
	// check if member have the right to set new owner
	if !m.IsOwner() {
		return errorcodes.ErrConversationMemberSetOwner.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	for _, member := range m.conversation.Members {
		if member.Contact.ID == contactID {
			member.Status = ConversationMember_Owner
			return nil
		}
	}

	return errorcodes.ErrConversationMemberSetOwner.Wrap(
		errorcodes.ErrConversationMembers.Wrap(
			errorcodes.ErrConversationMemberContactID.New(),
		),
	)
}

func (m *conversationMember) Block(contactID string) error {
	// check if member have the right to block
	if !m.IsOwner() {
		return errorcodes.ErrConversationMemberBlock.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	// check if contact is an owner
	cm, err := m.conversation.GetMember(contactID)
	if err != nil {
		return errorcodes.ErrConversationMemberBlock.Wrap(err)
	}
	if cm.IsOwner() {
		return errorcodes.ErrConversationMemberBlock.Wrap(
			errorcodes.ErrConversationMemberContact.Wrap(
				errorcodes.ErrConversationMemberStatus.New(),
			),
		)
	}

	// then block the contact
	for _, member := range m.conversation.Members {
		if member.Contact.ID == contactID {
			member.Status = ConversationMember_Blocked
			return nil
		}
	}

	return errorcodes.ErrConversationMemberBlock.Wrap(
		errorcodes.ErrConversationMembers.Wrap(
			errorcodes.ErrConversationMemberContactID.New(),
		),
	)
}

func (m *conversationMember) Unblock(contactID string) error {
	// check if member have the right to unblock
	if !m.IsOwner() {
		return errorcodes.ErrConversationMemberUnblock.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	for _, member := range m.conversation.Members {
		if member.Contact.ID == contactID {
			member.Status = ConversationMember_Active
			return nil
		}
	}

	return errorcodes.ErrConversationMemberBlock.Wrap(
		errorcodes.ErrConversationMembers.Wrap(
			errorcodes.ErrConversationMemberContactID.New(),
		),
	)
}

func (m *conversationMember) Read(at time.Time) error {
	// check if member have the right to read
	if !m.IsActive() {
		return errorcodes.ErrConversationMemberRead.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	at = at.UTC()

	m.ReadAt = at
	// say that conversation has been read by at least one user
	m.conversation.ReadAt = at
	return nil
}

func (m *conversationMember) Write(at time.Time, message *Message) error {
	// check if member have the right to write
	if !m.IsActive() {
		return errorcodes.ErrConversationMemberWrite.Wrap(
			errorcodes.ErrConversationMemberStatus.New(),
		)
	}

	at = at.UTC()

	m.ReadAt = at
	m.WroteAt = at
	m.conversation.WroteAt = at

	if m.conversation.IsOneToOne() {
		m.conversation.Infos = message.Text
	} else {
		m.conversation.Infos = m.Contact.DisplayName + ": " + message.Text
	}

	return nil
}

func (m conversationMember) Filtered() *ConversationMember {
	member := ConversationMember{
		ID:     m.ID,
		Status: m.Status,
	}
	if m.Contact != nil {
		member.Contact = m.Contact.Filtered()
	}
	return &member
}

func (m ConversationMember) Filtered() *ConversationMember {
	member := ConversationMember{
		ID:     m.ID,
		Status: m.Status,
	}
	if m.Contact != nil {
		member.Contact = m.Contact.Filtered()
	}
	return &member
}

func (c Conversation) IsNode() {} // required by gqlgen

func (m ConversationMember) IsNode() {} // required by gqlgen
