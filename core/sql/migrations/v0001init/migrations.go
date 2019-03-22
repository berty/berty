package v0001init

import (
	"time"

	"berty.tech/core/entity"
	"github.com/jinzhu/gorm"
	gormigrate "gopkg.in/gormigrate.v1"
)

type Event_Direction int32
type Kind int32
type SenderAlias_Status int32
type Device_Status int32
type Contact_Status int32
type ConversationMember_Status int32

type SenderAlias struct {
	ID                   string             `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time          `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time          `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Status               SenderAlias_Status `protobuf:"varint,5,opt,name=status,proto3,enum=berty.entity.SenderAlias_Status" json:"status,omitempty"`
	OriginDeviceID       string             `protobuf:"bytes,6,opt,name=origin_device_id,json=originDeviceId,proto3" json:"origin_device_id,omitempty"`
	ContactID            string             `protobuf:"bytes,7,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	ConversationID       string             `protobuf:"bytes,8,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	AliasIdentifier      string             `protobuf:"bytes,9,opt,name=alias_identifier,json=aliasIdentifier,proto3" json:"alias_identifier,omitempty"`
	Used                 bool               `protobuf:"varint,10,opt,name=used,proto3" json:"used,omitempty"`
	XXX_NoUnkeyedLiteral struct{}           `json:"-"`
	XXX_unrecognized     []byte             `json:"-"`
	XXX_sizecache        int32              `json:"-"`
}

type Device struct {
	ID                   string        `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time     `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time     `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Name                 string        `protobuf:"bytes,5,opt,name=name,proto3" json:"name,omitempty"`
	Status               Device_Status `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.Device_Status" json:"status,omitempty"`
	ApiVersion           uint32        `protobuf:"varint,11,opt,name=api_version,json=apiVersion,proto3" json:"api_version,omitempty"`
	ContactID            string        `protobuf:"bytes,12,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}      `json:"-"`
	XXX_unrecognized     []byte        `json:"-"`
	XXX_sizecache        int32         `json:"-"`
}

type Contact struct {
	ID                    string         `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt             time.Time      `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt             time.Time      `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Sigchain              []byte         `protobuf:"bytes,10,opt,name=sigchain,proto3" json:"sigchain,omitempty"`
	Status                Contact_Status `protobuf:"varint,11,opt,name=status,proto3,enum=berty.entity.Contact_Status" json:"status,omitempty"`
	Devices               []*Device      `protobuf:"bytes,12,rep,name=devices" json:"devices,omitempty"`
	DisplayName           string         `protobuf:"bytes,13,opt,name=display_name,json=displayName,proto3" json:"display_name,omitempty"`
	DisplayStatus         string         `protobuf:"bytes,14,opt,name=display_status,json=displayStatus,proto3" json:"display_status,omitempty"`
	OverrideDisplayName   string         `protobuf:"bytes,15,opt,name=override_display_name,json=overrideDisplayName,proto3" json:"override_display_name,omitempty"`
	OverrideDisplayStatus string         `protobuf:"bytes,16,opt,name=override_display_status,json=overrideDisplayStatus,proto3" json:"override_display_status,omitempty"`
	XXX_NoUnkeyedLiteral  struct{}       `json:"-"`
	XXX_unrecognized      []byte         `json:"-"`
	XXX_sizecache         int32          `json:"-"`
}

type ConversationMember struct {
	ID                   string                    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time                 `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time                 `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Status               ConversationMember_Status `protobuf:"varint,10,opt,name=status,proto3,enum=berty.entity.ConversationMember_Status" json:"status,omitempty"`
	Contact              *Contact                  `protobuf:"bytes,100,opt,name=contact" json:"contact,omitempty"`
	ConversationID       string                    `protobuf:"bytes,101,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	ContactID            string                    `protobuf:"bytes,102,opt,name=contact_id,json=contactId,proto3" json:"contact_id,omitempty"`
	XXX_NoUnkeyedLiteral struct{}                  `json:"-"`
	XXX_unrecognized     []byte                    `json:"-"`
	XXX_sizecache        int32                     `json:"-"`
}

type Conversation struct {
	ID                   string                `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time             `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time             `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	ReadAt               time.Time             `protobuf:"bytes,4,opt,name=read_at,json=readAt,stdtime" json:"read_at"`
	Title                string                `protobuf:"bytes,20,opt,name=title,proto3" json:"title,omitempty"`
	Topic                string                `protobuf:"bytes,21,opt,name=topic,proto3" json:"topic,omitempty"`
	Members              []*ConversationMember `protobuf:"bytes,100,rep,name=members" json:"members,omitempty"`
	XXX_NoUnkeyedLiteral struct{}              `json:"-"`
	XXX_unrecognized     []byte                `json:"-"`
	XXX_sizecache        int32                 `json:"-"`
}

type Config struct {
	ID                   string    `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	Myself               *Contact  `protobuf:"bytes,5,opt,name=myself" json:"myself,omitempty"`
	MyselfID             string    `protobuf:"bytes,6,opt,name=myself_id,json=myselfId,proto3" json:"myself_id,omitempty"`
	CurrentDevice        *Device   `protobuf:"bytes,7,opt,name=current_device,json=currentDevice" json:"current_device,omitempty"`
	CurrentDeviceID      string    `protobuf:"bytes,8,opt,name=current_device_id,json=currentDeviceId,proto3" json:"current_device_id,omitempty"`
	CryptoParams         []byte    `protobuf:"bytes,9,opt,name=crypto_params,json=cryptoParams,proto3" json:"crypto_params,omitempty"`
	PushRelayPubkeyAPNS  string    `protobuf:"bytes,10,opt,name=push_relay_pubkey_apns,json=pushRelayPubkeyApns,proto3" json:"push_relay_pubkey_apns,omitempty"`
	PushRelayPubkeyFCM   string    `protobuf:"bytes,11,opt,name=push_relay_pubkey_fcm,json=pushRelayPubkeyFcm,proto3" json:"push_relay_pubkey_fcm,omitempty"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

type MetadataKeyValue struct {
	Key                  string   `protobuf:"bytes,1,opt,name=key,proto3" json:"key,omitempty"`
	Values               []string `protobuf:"bytes,2,rep,name=values" json:"values,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

type Event struct {
	// ID is a unique ID generated by the event creator.
	// This field is required by gorm.
	ID string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	// Sender is the ID of the sender.
	// this field is a member of the composite primary key to avoid id collisions.
	SenderID string `protobuf:"bytes,2,opt,name=sender_id,json=senderId,proto3" json:"sender_id,omitempty" gorm:"primary_key"`
	// CreatedAt is set to current date when initializing a new Event object.
	// This field is required by gorm.
	CreatedAt time.Time `protobuf:"bytes,3,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	// UpdatedAt is set to current date each time the object is updated in database.
	// This field is required by gorm.
	UpdatedAt time.Time `protobuf:"bytes,4,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	// SentAt is set to current date just after sending the event.
	SentAt *time.Time `protobuf:"bytes,6,opt,name=sent_at,json=sentAt,stdtime" json:"sent_at,omitempty"`
	// ReceivedAt is set to current date just after receiving the event.
	ReceivedAt *time.Time `protobuf:"bytes,7,opt,name=received_at,json=receivedAt,stdtime" json:"received_at,omitempty"`
	// AckedAt is set to current date just after receiving a `Ack` event.
	AckedAt *time.Time `protobuf:"bytes,8,opt,name=acked_at,json=ackedAt,stdtime" json:"acked_at,omitempty"`
	// Direction is sent to Outgoing by the sender and to Incoming by the receiver.
	Direction Event_Direction `protobuf:"varint,9,opt,name=direction,proto3,enum=berty.entity.Event_Direction" json:"direction,omitempty"`
	// SenderAPIVersion is set by the sender when creating the message to be sent.
	SenderAPIVersion uint32 `protobuf:"varint,10,opt,name=sender_api_version,json=senderApiVersion,proto3" json:"sender_api_version,omitempty"`
	// ReceiverAPIVersion is set by the receiver when receiving a message.
	// this field may be useful to apply local migrations when processing old events stored in db.
	ReceiverAPIVersion uint32 `protobuf:"varint,11,opt,name=receiver_api_version,json=receiverApiVersion,proto3" json:"receiver_api_version,omitempty"`
	// Receiver is the ID of the receiver.
	ReceiverID string `protobuf:"bytes,12,opt,name=receiver_id,json=receiverId,proto3" json:"receiver_id,omitempty"`
	// Kind is an enum defining the event type.
	Kind Kind `protobuf:"varint,13,opt,name=kind,proto3,enum=berty.entity.Kind" json:"kind,omitempty"`
	// Attributes is a nested protobuf message containing per-event-type additional attributes, stored in db.
	Attributes []byte `protobuf:"bytes,14,opt,name=attributes,proto3" json:"attributes,omitempty"`
	// ConversationID needs to be set if the event belongs to a conversation.
	ConversationID string `protobuf:"bytes,15,opt,name=conversation_id,json=conversationId,proto3" json:"conversation_id,omitempty"`
	// SeenAt is set to the date when the event has been displayed on the user's screen
	SeenAt *time.Time `protobuf:"bytes,16,opt,name=seen_at,json=seenAt,stdtime" json:"seen_at,omitempty"`
	// Additional metadata
	Metadata             []*MetadataKeyValue `protobuf:"bytes,99,rep,name=metadata" json:"metadata,omitempty" gorm:"-"`
	XXX_NoUnkeyedLiteral struct{}            `json:"-"`
	XXX_unrecognized     []byte              `json:"-"`
	XXX_sizecache        int32               `json:"-"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "0001_init",
		Migrate: func(tx *gorm.DB) error {
			return tx.AutoMigrate(
				SenderAlias{},
				Device{},
				Contact{},
				Conversation{},
				ConversationMember{},
				Config{},
				entity.Event{},
			).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return dropDatabase(tx)
		},
	}
}

func dropDatabase(db *gorm.DB) error {
	var tables []interface{}
	for _, table := range allTables() {
		tables = append(tables, table)
	}
	return db.DropTableIfExists(tables...).Error
}

func allTables() []string {
	return []string{
		// events
		"event",

		// entities
		"sender_alias",
		"device",
		"device_push_identifier",
		"device_push_config",
		"contact",
		"conversation",
		"conversation_member",
		"config",

		// association tables
		// FIXME: add m2m

		// internal
		"migrations",
	}
}
