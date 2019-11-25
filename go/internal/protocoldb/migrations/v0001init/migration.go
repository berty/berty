package v0001init

import (
	"time"

	"github.com/jinzhu/gorm"
	"gopkg.in/gormigrate.v1"
)

type EnumValueInt32 int32

type GroupInfo struct {
	// Fields
	// - Group details/meta
	GroupPubKey     []byte         `protobuf:"bytes,1,opt,name=group_pub_key,json=groupPubKey,proto3" json:"group_pub_key,omitempty" gorm:"primary_key"`
	GroupSigningKey []byte         `protobuf:"bytes,2,opt,name=group_signing_key,json=groupSigningKey,proto3" json:"group_signing_key,omitempty"`
	Metadata        []byte         `protobuf:"bytes,3,opt,name=metadata,proto3" json:"metadata,omitempty"`
	Audience        EnumValueInt32 `protobuf:"varint,4,opt,name=audience,proto3,enum=berty.protocolmodel.GroupInfo_GroupAudience" json:"audience,omitempty" gorm:"index"`
	Version         uint32         `protobuf:"varint,5,opt,name=version,proto3" json:"version,omitempty"`
	// - Own secrets
	SelfPrivKeyAccount   []byte `protobuf:"bytes,6,opt,name=self_priv_key_account,json=selfPrivKeyAccount,proto3" json:"self_priv_key_account,omitempty"`
	SelfPrivKeyDevice    []byte `protobuf:"bytes,7,opt,name=self_priv_key_device,json=selfPrivKeyDevice,proto3" json:"self_priv_key_device,omitempty"`
	SelfInviterPubKey    []byte `protobuf:"bytes,8,opt,name=self_inviter_pub_key,json=selfInviterPubKey,proto3" json:"self_inviter_pub_key,omitempty"`
	InviterContactPubKey []byte `protobuf:"bytes,9,opt,name=inviter_contact_pub_key,json=inviterContactPubKey,proto3" json:"inviter_contact_pub_key,omitempty"`
	// - OrbitDB current log positions
	OrbitDBCurrentCIDMessage []byte `protobuf:"bytes,10,opt,name=orbitdb_current_cid_message,json=orbitdbCurrentCidMessage,proto3" json:"orbitdb_current_cid_message,omitempty"`
	OrbitDBCurrentCIDSecret  []byte `protobuf:"bytes,11,opt,name=orbitdb_current_cid_secret,json=orbitdbCurrentCidSecret,proto3" json:"orbitdb_current_cid_secret,omitempty"`
	OrbitDBCurrentCIDSetting []byte `protobuf:"bytes,12,opt,name=orbitdb_current_cid_setting,json=orbitdbCurrentCidSetting,proto3" json:"orbitdb_current_cid_setting,omitempty"`
	OrbitDBCurrentCIDMember  []byte `protobuf:"bytes,13,opt,name=orbitdb_current_cid_member,json=orbitdbCurrentCidMember,proto3" json:"orbitdb_current_cid_member,omitempty"`
	// Relation
	Members []*GroupMember `protobuf:"bytes,80,rep,name=members,proto3" json:"members,omitempty" gorm:"foreignkey:group_pub_key"`
	Inviter *Contact       `protobuf:"bytes,81,opt,name=inviter,proto3" json:"inviter,omitempty" gorm:"foreignkey:inviter_contact_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
}

type GroupIncomingRequest struct {
	// Fields
	GroupPubKey          []byte `protobuf:"bytes,1,opt,name=group_pub_key,json=groupPubKey,proto3" json:"group_pub_key,omitempty" gorm:"primary_key"`
	InviterMemberPubKey  []byte `protobuf:"bytes,2,opt,name=inviter_member_pub_key,json=inviterMemberPubKey,proto3" json:"inviter_member_pub_key,omitempty"`
	InvitationSig        []byte `protobuf:"bytes,3,opt,name=invitation_sig,json=invitationSig,proto3" json:"invitation_sig,omitempty"`
	InvitationPrivKey    []byte `protobuf:"bytes,4,opt,name=invitation_priv_key,json=invitationPrivKey,proto3" json:"invitation_priv_key,omitempty"`
	GroupSigningKey      []byte `protobuf:"bytes,5,opt,name=group_signing_key,json=groupSigningKey,proto3" json:"group_signing_key,omitempty"`
	GroupVersion         []byte `protobuf:"bytes,6,opt,name=group_version,json=groupVersion,proto3" json:"group_version,omitempty"`
	EssentialMetadata    []byte `protobuf:"bytes,7,opt,name=essential_metadata,json=essentialMetadata,proto3" json:"essential_metadata,omitempty"`
	InviterContactPubKey []byte `protobuf:"bytes,9,opt,name=inviter_contact_pub_key,json=inviterContactPubKey,proto3" json:"inviter_contact_pub_key,omitempty"`
	// Relations
	InviterContact *Contact `protobuf:"bytes,8,opt,name=inviter_contact,json=inviterContact,proto3" json:"inviter_contact,omitempty" gorm:"foreignkey:inviter_contact_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at,omitempty"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at,omitempty"`
}

type GroupMember struct {
	// Fields
	GroupMemberPubKey          []byte `protobuf:"bytes,1,opt,name=group_member_pub_key,json=groupMemberPubKey,proto3" json:"group_member_pub_key,omitempty" gorm:"primary_key"`
	GroupPubKey                []byte `protobuf:"bytes,2,opt,name=group_pub_key,json=groupPubKey,proto3" json:"group_pub_key,omitempty" gorm:"not null"`
	InviterPubKey              []byte `protobuf:"bytes,3,opt,name=inviter_pub_key,json=inviterPubKey,proto3" json:"inviter_pub_key,omitempty"`
	ContactAccountPubKey       []byte `protobuf:"bytes,4,opt,name=contact_account_pub_key,json=contactAccountPubKey,proto3" json:"contact_account_pub_key,omitempty"`
	ContactAccountBindingProof []byte `protobuf:"bytes,5,opt,name=contact_account_binding_proof,json=contactAccountBindingProof,proto3" json:"contact_account_binding_proof,omitempty"`
	Metadata                   []byte `protobuf:"bytes,6,opt,name=metadata,proto3" json:"metadata,omitempty"`
	// Relations
	Devices   []*GroupMemberDevice `protobuf:"bytes,80,rep,name=devices,proto3" json:"devices,omitempty" gorm:"foreignkey:group_member_pub_key"`
	GroupInfo GroupInfo            `protobuf:"bytes,81,opt,name=group_info,json=groupInfo,proto3" json:"group_info" gorm:"foreignkey:group_pub_key"`
	Inviter   *GroupMember         `protobuf:"bytes,82,opt,name=inviter,proto3" json:"inviter,omitempty" gorm:"foreignkey:inviter_pub_key"`
	Contact   *Contact             `protobuf:"bytes,83,opt,name=contact,proto3" json:"contact,omitempty" gorm:"foreignkey:contact_account_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at,omitempty"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at,omitempty"`
}

type GroupMemberDevice struct {
	// Fields
	GroupMemberDevicePubKey []byte `protobuf:"bytes,1,opt,name=group_member_device_pub_key,json=groupMemberDevicePubKey,proto3" json:"group_member_device_pub_key,omitempty" gorm:"primary_key"`
	GroupMemberPubKey       []byte `protobuf:"bytes,2,opt,name=group_member_pub_key,json=groupMemberPubKey,proto3" json:"group_member_pub_key,omitempty"`
	DerivationState         []byte `protobuf:"bytes,3,opt,name=derivation_state,json=derivationState,proto3" json:"derivation_state,omitempty"`
	DerivationCounter       uint64 `protobuf:"varint,4,opt,name=derivation_counter,json=derivationCounter,proto3" json:"derivation_counter,omitempty"`
	DerivationNextHotp      []byte `protobuf:"bytes,5,opt,name=derivation_next_hotp,json=derivationNextHotp,proto3" json:"derivation_next_hotp,omitempty" gorm:"index"`
	// Relations
	GroupMember GroupMember `protobuf:"bytes,80,opt,name=group_member,json=groupMember,proto3" json:"group_member" gorm:"foreignkey:group_member_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at,omitempty"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at,omitempty"`
}

type Contact struct {
	// Fields
	AccountPubKey       []byte         `protobuf:"bytes,1,opt,name=account_pub_key,json=accountPubKey,proto3" json:"account_pub_key,omitempty" gorm:"primary_key"`
	OneToOneGroupPubKey []byte         `protobuf:"bytes,2,opt,name=one_to_one_group_pub_key,json=oneToOneGroupPubKey,proto3" json:"one_to_one_group_pub_key,omitempty"`
	BinderPubKey        []byte         `protobuf:"bytes,3,opt,name=binder_pub_key,json=binderPubKey,proto3" json:"binder_pub_key,omitempty"`
	TrustLevel          EnumValueInt32 `protobuf:"varint,4,opt,name=trust_level,json=trustLevel,proto3,enum=berty.protocolmodel.Contact_TrustLevel" json:"trust_level,omitempty" gorm:"index"`
	Metadata            []byte         `protobuf:"bytes,5,opt,name=metadata,proto3" json:"metadata,omitempty"`
	Blocked             bool           `protobuf:"varint,6,opt,name=blocked,proto3" json:"blocked,omitempty"`
	// Relations
	OneToOneGroup *GroupInfo `protobuf:"bytes,80,opt,name=one_to_one_group,json=oneToOneGroup,proto3" json:"one_to_one_group,omitempty" gorm:"foreignkey:group_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
}

type Message struct {
	// Fields
	GroupPubKey             []byte `protobuf:"bytes,1,opt,name=group_pub_key,json=groupPubKey,proto3" json:"group_pub_key,omitempty" gorm:"primary_key"`
	EntryCid                []byte `protobuf:"bytes,2,opt,name=entry_cid,json=entryCid,proto3" json:"entry_cid,omitempty" gorm:"index"`
	MessageKey              []byte `protobuf:"bytes,3,opt,name=message_key,json=messageKey,proto3" json:"message_key,omitempty"`
	GroupMemberDevicePubKey []byte `protobuf:"bytes,4,opt,name=group_member_device_pub_key,json=groupMemberDevicePubKey,proto3" json:"group_member_device_pub_key,omitempty"`
	// Relations
	Device *GroupMemberDevice `protobuf:"bytes,80,opt,name=device,proto3" json:"device,omitempty" gorm:"foreignkey:group_member_device_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at,omitempty"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at,omitempty"`
}

type MyselfAccount struct {
	// Fields
	AccountPubKey                []byte `protobuf:"bytes,1,opt,name=account_pub_key,json=accountPubKey,proto3" json:"account_pub_key,omitempty" gorm:"primary_key"`
	AccountBindingPrivKey        []byte `protobuf:"bytes,2,opt,name=account_binding_priv_key,json=accountBindingPrivKey,proto3" json:"account_binding_priv_key,omitempty"`
	SharedSecret                 []byte `protobuf:"bytes,3,opt,name=shared_secret,json=sharedSecret,proto3" json:"shared_secret,omitempty"`
	PublicRendezvousPointSeed    []byte `protobuf:"bytes,4,opt,name=public_rendezvous_point_seed,json=publicRendezvousPointSeed,proto3" json:"public_rendezvous_point_seed,omitempty"`
	PublicRendezvousPointEnabled bool   `protobuf:"varint,5,opt,name=public_rendezvous_point_enabled,json=publicRendezvousPointEnabled,proto3" json:"public_rendezvous_point_enabled,omitempty"`
	SigChain                     []byte `protobuf:"bytes,6,opt,name=sig_chain,json=sigChain,proto3" json:"sig_chain,omitempty"`
	// Relations
	Devices []*MyselfDevice `protobuf:"bytes,80,rep,name=devices,proto3" json:"devices,omitempty" gorm:"foreignkey:account_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at,omitempty"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at,omitempty"`
}

type MyselfDevice struct {
	// Fields
	DevicePubKey  []byte `protobuf:"bytes,1,opt,name=device_pub_key,json=devicePubKey,proto3" json:"device_pub_key,omitempty" gorm:"primary_key"`
	DevicePrivKey []byte `protobuf:"bytes,2,opt,name=device_priv_key,json=devicePrivKey,proto3" json:"device_priv_key,omitempty"`
	AccountPubKey []byte `protobuf:"bytes,3,opt,name=account_pub_key,json=accountPubKey,proto3" json:"account_pub_key,omitempty"`
	// Relations
	Account MyselfAccount `protobuf:"bytes,80,opt,name=account,proto3" json:"account" gorm:"foreignkey:account_pub_key"`
	// GORM meta
	CreatedAt time.Time `protobuf:"bytes,98,opt,name=created_at,json=createdAt,proto3,stdtime" json:"created_at"`
	UpdatedAt time.Time `protobuf:"bytes,99,opt,name=updated_at,json=updatedAt,proto3,stdtime" json:"updated_at"`
}

func GetMigration() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "v0001_init",
		Migrate: func(db *gorm.DB) error {
			return db.AutoMigrate(
				&GroupInfo{},
				&GroupIncomingRequest{},
				&GroupMember{},
				&GroupMemberDevice{},
				&Contact{},
				&Message{},
				&MyselfAccount{},
				&MyselfDevice{},
			).Error
		},
	}
}
