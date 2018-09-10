// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	fmt "fmt"
	io "io"
	strconv "strconv"

	scalar "berty.tech/core/api/node/graphql/scalar"
)

type BertyEntityContact struct {
	ID                    string                    `json:"id"`
	CreatedAt             *scalar.DateTime          `json:"createdAt"`
	UpdatedAt             *scalar.DateTime          `json:"updatedAt"`
	DeletedAt             *scalar.DateTime          `json:"deletedAt"`
	Sigchain              *string                   `json:"sigchain"`
	Status                *BertyEntityContactStatus `json:"status"`
	Devices               []*BertyEntityDevice      `json:"devices"`
	DisplayName           *string                   `json:"displayName"`
	DisplayStatus         *string                   `json:"displayStatus"`
	OverrideDisplayName   *string                   `json:"overrideDisplayName"`
	OverrideDisplayStatus *string                   `json:"overrideDisplayStatus"`
}
type BertyEntityConversation struct {
	ID        string                           `json:"id"`
	CreatedAt *scalar.DateTime                 `json:"createdAt"`
	UpdatedAt *scalar.DateTime                 `json:"updatedAt"`
	DeletedAt *scalar.DateTime                 `json:"deletedAt"`
	Title     *string                          `json:"title"`
	Topic     *string                          `json:"topic"`
	Members   []*BertyEntityConversationMember `json:"members"`
}
type BertyEntityConversationMember struct {
	ID             string                               `json:"id"`
	CreatedAt      *scalar.DateTime                     `json:"createdAt"`
	UpdatedAt      *scalar.DateTime                     `json:"updatedAt"`
	DeletedAt      *scalar.DateTime                     `json:"deletedAt"`
	Status         *BertyEntityConversationMemberStatus `json:"status"`
	Contact        *BertyEntityContact                  `json:"contact"`
	ConversationID *string                              `json:"conversationId"`
	ContactID      *string                              `json:"contactId"`
}
type BertyEntityDevice struct {
	ID         string                   `json:"id"`
	CreatedAt  *scalar.DateTime         `json:"createdAt"`
	UpdatedAt  *scalar.DateTime         `json:"updatedAt"`
	DeletedAt  *scalar.DateTime         `json:"deletedAt"`
	Name       *string                  `json:"name"`
	Status     *BertyEntityDeviceStatus `json:"status"`
	APIVersion *int                     `json:"apiVersion"`
	ContactID  *string                  `json:"contactId"`
}
type BertyEntityMessage struct {
	Text *string `json:"text"`
}
type BertyNodeContactRequestInput struct {
	Contact   *BertyEntityContact `json:"contact"`
	IntroText *string             `json:"introText"`
}
type BertyNodeConversationAddMessageInput struct {
	Conversation *BertyEntityConversation `json:"conversation"`
	Message      *BertyEntityMessage      `json:"message"`
}
type BertyNodeConversationManageMembersInput struct {
	Conversation *BertyEntityConversation         `json:"conversation"`
	Members      []*BertyEntityConversationMember `json:"members"`
}
type BertyNodeEventListInput struct {
	Limit  *int           `json:"limit"`
	Filter *BertyP2pEvent `json:"filter"`
}
type BertyNodeEventStreamInput struct {
	Filter *BertyP2pEvent `json:"filter"`
}
type BertyNodeVoid struct {
	T *bool `json:"T"`
}
type BertyP2pAckAttrs struct {
	Ids    []*string `json:"ids"`
	ErrMsg *string   `json:"ErrMsg"`
}
type BertyP2pContactRequestAcceptedAttrs struct {
	T *bool `json:"T"`
}
type BertyP2pContactRequestAttrs struct {
	Me        *BertyEntityContact `json:"me"`
	IntroText *string             `json:"introText"`
}
type BertyP2pContactShareAttrs struct {
	Contact *BertyEntityContact `json:"contact"`
}
type BertyP2pContactShareMeAttrs struct {
	Me *BertyEntityContact `json:"me"`
}
type BertyP2pConversationInviteAttrs struct {
	Conversation *BertyEntityConversation `json:"conversation"`
}
type BertyP2pConversationNewMessageAttrs struct {
	Message *BertyEntityMessage `json:"message"`
}
type BertyP2pEvent struct {
	ID                 string                  `json:"id"`
	SenderID           *string                 `json:"senderId"`
	CreatedAt          *scalar.DateTime        `json:"createdAt"`
	UpdatedAt          *scalar.DateTime        `json:"updatedAt"`
	DeletedAt          *scalar.DateTime        `json:"deletedAt"`
	SentAt             *scalar.DateTime        `json:"sentAt"`
	ReceivedAt         *scalar.DateTime        `json:"receivedAt"`
	AckedAt            *scalar.DateTime        `json:"ackedAt"`
	Direction          *BertyP2pEventDirection `json:"direction"`
	SenderAPIVersion   *int                    `json:"senderApiVersion"`
	ReceiverAPIVersion *int                    `json:"receiverApiVersion"`
	ReceiverID         *string                 `json:"receiverId"`
	Kind               *BertyP2pKind           `json:"kind"`
	Attributes         *string                 `json:"attributes"`
	ConversationID     *string                 `json:"conversationId"`
}
type BertyP2pPingAttrs struct {
	T *bool `json:"T"`
}
type BertyP2pSentAttrs struct {
	Ids []*string `json:"ids"`
}
type ContactRemoveInput struct {
	ContactID        string `json:"contactID"`
	ClientMutationID string `json:"clientMutationId"`
}
type ContactRemovePayload struct {
	BertyEntityContact *BertyEntityContact `json:"bertyEntityContact"`
	ClientMutationID   string              `json:"clientMutationId"`
}
type ContactRequestInput struct {
	ContactID        string  `json:"contactID"`
	IntroText        *string `json:"introText"`
	ClientMutationID string  `json:"clientMutationId"`
}
type ContactRequestPayload struct {
	BertyEntityContact *BertyEntityContact `json:"bertyEntityContact"`
	ClientMutationID   string              `json:"clientMutationId"`
}
type ContactUpdateInput struct {
	ContactID        string  `json:"contactID"`
	DisplayName      *string `json:"displayName"`
	ClientMutationID string  `json:"clientMutationId"`
}
type ContactUpdatePayload struct {
	BertyEntityContact *BertyEntityContact `json:"bertyEntityContact"`
	ClientMutationID   string              `json:"clientMutationId"`
}
type ConversationAddMessageInput struct {
	ConversationID   string `json:"conversationID"`
	Message          string `json:"message"`
	ClientMutationID string `json:"clientMutationId"`
}
type ConversationAddMessagePayload struct {
	BertyP2pEvent    *BertyP2pEvent `json:"bertyP2pEvent"`
	ClientMutationID string         `json:"clientMutationId"`
}
type ConversationCreateInput struct {
	ContactsID       []string `json:"contactsID"`
	ClientMutationID string   `json:"clientMutationId"`
}
type ConversationCreatePayload struct {
	BertyEntityConversation *BertyEntityConversation `json:"bertyEntityConversation"`
	ClientMutationID        string                   `json:"clientMutationId"`
}
type ConversationExcludeInput struct {
	ConversationID   string   `json:"conversationID"`
	ContactsID       []string `json:"contactsID"`
	ClientMutationID string   `json:"clientMutationId"`
}
type ConversationExcludePayload struct {
	BertyEntityConversation *BertyEntityConversation `json:"bertyEntityConversation"`
	ClientMutationID        string                   `json:"clientMutationId"`
}
type ConversationInviteInput struct {
	ConversationID   string   `json:"conversationID"`
	ContactsID       []string `json:"contactsID"`
	ClientMutationID string   `json:"clientMutationId"`
}
type ConversationInvitePayload struct {
	BertyEntityConversation *BertyEntityConversation `json:"bertyEntityConversation"`
	ClientMutationID        string                   `json:"clientMutationId"`
}
type GenerateFakeDataInput struct {
	ClientMutationID string `json:"clientMutationId"`
}
type GenerateFakeDataPayload struct {
	BertyNodeVoid    *BertyNodeVoid `json:"bertyNodeVoid"`
	ClientMutationID string         `json:"clientMutationId"`
}
type GoogleProtobufDescriptorProto struct {
	Name           *string                                        `json:"name"`
	Field          []*GoogleProtobufFieldDescriptorProto          `json:"field"`
	Extension      []*GoogleProtobufFieldDescriptorProto          `json:"extension"`
	NestedType     []*GoogleProtobufDescriptorProto               `json:"nestedType"`
	EnumType       []*GoogleProtobufEnumDescriptorProto           `json:"enumType"`
	ExtensionRange []*GoogleProtobufDescriptorProtoExtensionRange `json:"extensionRange"`
	OneofDecl      []*GoogleProtobufOneofDescriptorProto          `json:"oneofDecl"`
	Options        *GoogleProtobufMessageOptions                  `json:"options"`
	ReservedRange  []*GoogleProtobufDescriptorProtoReservedRange  `json:"reservedRange"`
	ReservedName   []*string                                      `json:"reservedName"`
}
type GoogleProtobufDescriptorProtoExtensionRange struct {
	Start   *int                                 `json:"start"`
	End     *int                                 `json:"end"`
	Options *GoogleProtobufExtensionRangeOptions `json:"options"`
}
type GoogleProtobufDescriptorProtoReservedRange struct {
	Start *int `json:"start"`
	End   *int `json:"end"`
}
type GoogleProtobufEnumDescriptorProto struct {
	Name          *string                                               `json:"name"`
	Value         []*GoogleProtobufEnumValueDescriptorProto             `json:"value"`
	Options       *GoogleProtobufEnumOptions                            `json:"options"`
	ReservedRange []*GoogleProtobufEnumDescriptorProtoEnumReservedRange `json:"reservedRange"`
	ReservedName  []*string                                             `json:"reservedName"`
}
type GoogleProtobufEnumDescriptorProtoEnumReservedRange struct {
	Start *int `json:"start"`
	End   *int `json:"end"`
}
type GoogleProtobufEnumOptions struct {
	AllowAlias          *bool                                `json:"allowAlias"`
	Deprecated          *bool                                `json:"deprecated"`
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufEnumValueDescriptorProto struct {
	Name    *string                         `json:"name"`
	Number  *int                            `json:"number"`
	Options *GoogleProtobufEnumValueOptions `json:"options"`
}
type GoogleProtobufEnumValueOptions struct {
	Deprecated          *bool                                `json:"deprecated"`
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufExtensionRangeOptions struct {
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufFieldDescriptorProto struct {
	Name         *string                                  `json:"name"`
	Number       *int                                     `json:"number"`
	Label        *GoogleProtobufFieldDescriptorProtoLabel `json:"label"`
	Type         *GoogleProtobufFieldDescriptorProtoType  `json:"type"`
	TypeName     *string                                  `json:"typeName"`
	Extendee     *string                                  `json:"extendee"`
	DefaultValue *string                                  `json:"defaultValue"`
	OneofIndex   *int                                     `json:"oneofIndex"`
	JSONName     *string                                  `json:"jsonName"`
	Options      *GoogleProtobufFieldOptions              `json:"options"`
}
type GoogleProtobufFieldOptions struct {
	Ctype               *GoogleProtobufFieldOptionsCtype     `json:"ctype"`
	Packed              *bool                                `json:"packed"`
	Jstype              *GoogleProtobufFieldOptionsJstype    `json:"jstype"`
	Lazy                *bool                                `json:"lazy"`
	Deprecated          *bool                                `json:"deprecated"`
	Weak                *bool                                `json:"weak"`
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufFileDescriptorProto struct {
	Name             *string                                 `json:"name"`
	Package          *string                                 `json:"package"`
	Dependency       []*string                               `json:"dependency"`
	PublicDependency []*int                                  `json:"publicDependency"`
	WeakDependency   []*int                                  `json:"weakDependency"`
	MessageType      []*GoogleProtobufDescriptorProto        `json:"messageType"`
	EnumType         []*GoogleProtobufEnumDescriptorProto    `json:"enumType"`
	Service          []*GoogleProtobufServiceDescriptorProto `json:"service"`
	Extension        []*GoogleProtobufFieldDescriptorProto   `json:"extension"`
	Options          *GoogleProtobufFileOptions              `json:"options"`
	SourceCodeInfo   *GoogleProtobufSourceCodeInfo           `json:"sourceCodeInfo"`
	Syntax           *string                                 `json:"syntax"`
}
type GoogleProtobufFileDescriptorSet struct {
	File []*GoogleProtobufFileDescriptorProto `json:"file"`
}
type GoogleProtobufFileOptions struct {
	JavaPackage               *string                                `json:"javaPackage"`
	JavaOuterClassname        *string                                `json:"javaOuterClassname"`
	JavaMultipleFiles         *bool                                  `json:"javaMultipleFiles"`
	JavaGenerateEqualsAndHash *bool                                  `json:"javaGenerateEqualsAndHash"`
	JavaStringCheckUtf8       *bool                                  `json:"javaStringCheckUtf8"`
	OptimizeFor               *GoogleProtobufFileOptionsOptimizeMode `json:"optimizeFor"`
	GoPackage                 *string                                `json:"goPackage"`
	CcGenericServices         *bool                                  `json:"ccGenericServices"`
	JavaGenericServices       *bool                                  `json:"javaGenericServices"`
	PyGenericServices         *bool                                  `json:"pyGenericServices"`
	PhpGenericServices        *bool                                  `json:"phpGenericServices"`
	Deprecated                *bool                                  `json:"deprecated"`
	CcEnableArenas            *bool                                  `json:"ccEnableArenas"`
	ObjcClassPrefix           *string                                `json:"objcClassPrefix"`
	CsharpNamespace           *string                                `json:"csharpNamespace"`
	SwiftPrefix               *string                                `json:"swiftPrefix"`
	PhpClassPrefix            *string                                `json:"phpClassPrefix"`
	PhpNamespace              *string                                `json:"phpNamespace"`
	UninterpretedOption       []*GoogleProtobufUninterpretedOption   `json:"uninterpretedOption"`
}
type GoogleProtobufGeneratedCodeInfo struct {
	Annotation []*GoogleProtobufGeneratedCodeInfoAnnotation `json:"annotation"`
}
type GoogleProtobufGeneratedCodeInfoAnnotation struct {
	Path       []*int  `json:"path"`
	SourceFile *string `json:"sourceFile"`
	Begin      *int    `json:"begin"`
	End        *int    `json:"end"`
}
type GoogleProtobufMessageOptions struct {
	MessageSetWireFormat         *bool                                `json:"messageSetWireFormat"`
	NoStandardDescriptorAccessor *bool                                `json:"noStandardDescriptorAccessor"`
	Deprecated                   *bool                                `json:"deprecated"`
	MapEntry                     *bool                                `json:"mapEntry"`
	UninterpretedOption          []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufMethodDescriptorProto struct {
	Name            *string                      `json:"name"`
	InputType       *string                      `json:"inputType"`
	OutputType      *string                      `json:"outputType"`
	Options         *GoogleProtobufMethodOptions `json:"options"`
	ClientStreaming *bool                        `json:"clientStreaming"`
	ServerStreaming *bool                        `json:"serverStreaming"`
}
type GoogleProtobufMethodOptions struct {
	Deprecated          *bool                                        `json:"deprecated"`
	IdempotencyLevel    *GoogleProtobufMethodOptionsIdempotencyLevel `json:"idempotencyLevel"`
	UninterpretedOption []*GoogleProtobufUninterpretedOption         `json:"uninterpretedOption"`
}
type GoogleProtobufOneofDescriptorProto struct {
	Name    *string                     `json:"name"`
	Options *GoogleProtobufOneofOptions `json:"options"`
}
type GoogleProtobufOneofOptions struct {
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufServiceDescriptorProto struct {
	Name    *string                                `json:"name"`
	Method  []*GoogleProtobufMethodDescriptorProto `json:"method"`
	Options *GoogleProtobufServiceOptions          `json:"options"`
}
type GoogleProtobufServiceOptions struct {
	Deprecated          *bool                                `json:"deprecated"`
	UninterpretedOption []*GoogleProtobufUninterpretedOption `json:"uninterpretedOption"`
}
type GoogleProtobufSourceCodeInfo struct {
	Location []*GoogleProtobufSourceCodeInfoLocation `json:"location"`
}
type GoogleProtobufSourceCodeInfoLocation struct {
	Path                    []*int    `json:"path"`
	Span                    []*int    `json:"span"`
	LeadingComments         *string   `json:"leadingComments"`
	TrailingComments        *string   `json:"trailingComments"`
	LeadingDetachedComments []*string `json:"leadingDetachedComments"`
}
type GoogleProtobufTimestamp struct {
	Seconds *int `json:"seconds"`
	Nanos   *int `json:"nanos"`
}
type GoogleProtobufUninterpretedOption struct {
	Name             []*GoogleProtobufUninterpretedOptionNamePart `json:"name"`
	IdentifierValue  *string                                      `json:"identifierValue"`
	PositiveIntValue *int                                         `json:"positiveIntValue"`
	NegativeIntValue *int                                         `json:"negativeIntValue"`
	DoubleValue      *float64                                     `json:"doubleValue"`
	StringValue      *string                                      `json:"stringValue"`
	AggregateValue   *string                                      `json:"aggregateValue"`
}
type GoogleProtobufUninterpretedOptionNamePart struct {
	NamePart    *string `json:"namePart"`
	IsExtension *bool   `json:"isExtension"`
}
type Node interface{}

type BertyEntityContactStatus string

const (
	BertyEntityContactStatusUnknown         BertyEntityContactStatus = "Unknown"
	BertyEntityContactStatusIsFriend        BertyEntityContactStatus = "IsFriend"
	BertyEntityContactStatusIsTrustedFriend BertyEntityContactStatus = "IsTrustedFriend"
	BertyEntityContactStatusIsRequested     BertyEntityContactStatus = "IsRequested"
	BertyEntityContactStatusRequestedMe     BertyEntityContactStatus = "RequestedMe"
	BertyEntityContactStatusIsBlocked       BertyEntityContactStatus = "IsBlocked"
	BertyEntityContactStatusMyself          BertyEntityContactStatus = "Myself"
)

func (e BertyEntityContactStatus) IsValid() bool {
	switch e {
	case BertyEntityContactStatusUnknown, BertyEntityContactStatusIsFriend, BertyEntityContactStatusIsTrustedFriend, BertyEntityContactStatusIsRequested, BertyEntityContactStatusRequestedMe, BertyEntityContactStatusIsBlocked, BertyEntityContactStatusMyself:
		return true
	}
	return false
}

func (e BertyEntityContactStatus) String() string {
	return string(e)
}

func (e *BertyEntityContactStatus) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = BertyEntityContactStatus(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid BertyEntityContactStatus", str)
	}
	return nil
}

func (e BertyEntityContactStatus) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type BertyEntityConversationMemberStatus string

const (
	BertyEntityConversationMemberStatusUnknown BertyEntityConversationMemberStatus = "Unknown"
	BertyEntityConversationMemberStatusOwner   BertyEntityConversationMemberStatus = "Owner"
	BertyEntityConversationMemberStatusActive  BertyEntityConversationMemberStatus = "Active"
	BertyEntityConversationMemberStatusBlocked BertyEntityConversationMemberStatus = "Blocked"
)

func (e BertyEntityConversationMemberStatus) IsValid() bool {
	switch e {
	case BertyEntityConversationMemberStatusUnknown, BertyEntityConversationMemberStatusOwner, BertyEntityConversationMemberStatusActive, BertyEntityConversationMemberStatusBlocked:
		return true
	}
	return false
}

func (e BertyEntityConversationMemberStatus) String() string {
	return string(e)
}

func (e *BertyEntityConversationMemberStatus) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = BertyEntityConversationMemberStatus(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid BertyEntityConversationMemberStatus", str)
	}
	return nil
}

func (e BertyEntityConversationMemberStatus) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type BertyEntityDeviceStatus string

const (
	BertyEntityDeviceStatusUnknown      BertyEntityDeviceStatus = "Unknown"
	BertyEntityDeviceStatusConnected    BertyEntityDeviceStatus = "Connected"
	BertyEntityDeviceStatusDisconnected BertyEntityDeviceStatus = "Disconnected"
	BertyEntityDeviceStatusAvailable    BertyEntityDeviceStatus = "Available"
	BertyEntityDeviceStatusMyself       BertyEntityDeviceStatus = "Myself"
)

func (e BertyEntityDeviceStatus) IsValid() bool {
	switch e {
	case BertyEntityDeviceStatusUnknown, BertyEntityDeviceStatusConnected, BertyEntityDeviceStatusDisconnected, BertyEntityDeviceStatusAvailable, BertyEntityDeviceStatusMyself:
		return true
	}
	return false
}

func (e BertyEntityDeviceStatus) String() string {
	return string(e)
}

func (e *BertyEntityDeviceStatus) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = BertyEntityDeviceStatus(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid BertyEntityDeviceStatus", str)
	}
	return nil
}

func (e BertyEntityDeviceStatus) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type BertyP2pEventDirection string

const (
	BertyP2pEventDirectionUnknownDirection BertyP2pEventDirection = "UnknownDirection"
	BertyP2pEventDirectionIncoming         BertyP2pEventDirection = "Incoming"
	BertyP2pEventDirectionOutgoing         BertyP2pEventDirection = "Outgoing"
)

func (e BertyP2pEventDirection) IsValid() bool {
	switch e {
	case BertyP2pEventDirectionUnknownDirection, BertyP2pEventDirectionIncoming, BertyP2pEventDirectionOutgoing:
		return true
	}
	return false
}

func (e BertyP2pEventDirection) String() string {
	return string(e)
}

func (e *BertyP2pEventDirection) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = BertyP2pEventDirection(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid BertyP2pEventDirection", str)
	}
	return nil
}

func (e BertyP2pEventDirection) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type BertyP2pKind string

const (
	BertyP2pKindUnknown                BertyP2pKind = "Unknown"
	BertyP2pKindSent                   BertyP2pKind = "Sent"
	BertyP2pKindAck                    BertyP2pKind = "Ack"
	BertyP2pKindPing                   BertyP2pKind = "Ping"
	BertyP2pKindContactRequest         BertyP2pKind = "ContactRequest"
	BertyP2pKindContactRequestAccepted BertyP2pKind = "ContactRequestAccepted"
	BertyP2pKindContactShareMe         BertyP2pKind = "ContactShareMe"
	BertyP2pKindContactShare           BertyP2pKind = "ContactShare"
	BertyP2pKindConversationInvite     BertyP2pKind = "ConversationInvite"
	BertyP2pKindConversationNewMessage BertyP2pKind = "ConversationNewMessage"
)

func (e BertyP2pKind) IsValid() bool {
	switch e {
	case BertyP2pKindUnknown, BertyP2pKindSent, BertyP2pKindAck, BertyP2pKindPing, BertyP2pKindContactRequest, BertyP2pKindContactRequestAccepted, BertyP2pKindContactShareMe, BertyP2pKindContactShare, BertyP2pKindConversationInvite, BertyP2pKindConversationNewMessage:
		return true
	}
	return false
}

func (e BertyP2pKind) String() string {
	return string(e)
}

func (e *BertyP2pKind) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = BertyP2pKind(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid BertyP2pKind", str)
	}
	return nil
}

func (e BertyP2pKind) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufFieldDescriptorProtoLabel string

const (
	GoogleProtobufFieldDescriptorProtoLabelLabelOptional GoogleProtobufFieldDescriptorProtoLabel = "LABEL_OPTIONAL"
	GoogleProtobufFieldDescriptorProtoLabelLabelRequired GoogleProtobufFieldDescriptorProtoLabel = "LABEL_REQUIRED"
	GoogleProtobufFieldDescriptorProtoLabelLabelRepeated GoogleProtobufFieldDescriptorProtoLabel = "LABEL_REPEATED"
)

func (e GoogleProtobufFieldDescriptorProtoLabel) IsValid() bool {
	switch e {
	case GoogleProtobufFieldDescriptorProtoLabelLabelOptional, GoogleProtobufFieldDescriptorProtoLabelLabelRequired, GoogleProtobufFieldDescriptorProtoLabelLabelRepeated:
		return true
	}
	return false
}

func (e GoogleProtobufFieldDescriptorProtoLabel) String() string {
	return string(e)
}

func (e *GoogleProtobufFieldDescriptorProtoLabel) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufFieldDescriptorProtoLabel(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufFieldDescriptorProtoLabel", str)
	}
	return nil
}

func (e GoogleProtobufFieldDescriptorProtoLabel) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufFieldDescriptorProtoType string

const (
	GoogleProtobufFieldDescriptorProtoTypeTypeDouble   GoogleProtobufFieldDescriptorProtoType = "TYPE_DOUBLE"
	GoogleProtobufFieldDescriptorProtoTypeTypeFloat    GoogleProtobufFieldDescriptorProtoType = "TYPE_FLOAT"
	GoogleProtobufFieldDescriptorProtoTypeTypeInt64    GoogleProtobufFieldDescriptorProtoType = "TYPE_INT64"
	GoogleProtobufFieldDescriptorProtoTypeTypeUint64   GoogleProtobufFieldDescriptorProtoType = "TYPE_UINT64"
	GoogleProtobufFieldDescriptorProtoTypeTypeInt32    GoogleProtobufFieldDescriptorProtoType = "TYPE_INT32"
	GoogleProtobufFieldDescriptorProtoTypeTypeFixed64  GoogleProtobufFieldDescriptorProtoType = "TYPE_FIXED64"
	GoogleProtobufFieldDescriptorProtoTypeTypeFixed32  GoogleProtobufFieldDescriptorProtoType = "TYPE_FIXED32"
	GoogleProtobufFieldDescriptorProtoTypeTypeBool     GoogleProtobufFieldDescriptorProtoType = "TYPE_BOOL"
	GoogleProtobufFieldDescriptorProtoTypeTypeString   GoogleProtobufFieldDescriptorProtoType = "TYPE_STRING"
	GoogleProtobufFieldDescriptorProtoTypeTypeGroup    GoogleProtobufFieldDescriptorProtoType = "TYPE_GROUP"
	GoogleProtobufFieldDescriptorProtoTypeTypeMessage  GoogleProtobufFieldDescriptorProtoType = "TYPE_MESSAGE"
	GoogleProtobufFieldDescriptorProtoTypeTypeBytes    GoogleProtobufFieldDescriptorProtoType = "TYPE_BYTES"
	GoogleProtobufFieldDescriptorProtoTypeTypeUint32   GoogleProtobufFieldDescriptorProtoType = "TYPE_UINT32"
	GoogleProtobufFieldDescriptorProtoTypeTypeEnum     GoogleProtobufFieldDescriptorProtoType = "TYPE_ENUM"
	GoogleProtobufFieldDescriptorProtoTypeTypeSfixed32 GoogleProtobufFieldDescriptorProtoType = "TYPE_SFIXED32"
	GoogleProtobufFieldDescriptorProtoTypeTypeSfixed64 GoogleProtobufFieldDescriptorProtoType = "TYPE_SFIXED64"
	GoogleProtobufFieldDescriptorProtoTypeTypeSint32   GoogleProtobufFieldDescriptorProtoType = "TYPE_SINT32"
	GoogleProtobufFieldDescriptorProtoTypeTypeSint64   GoogleProtobufFieldDescriptorProtoType = "TYPE_SINT64"
)

func (e GoogleProtobufFieldDescriptorProtoType) IsValid() bool {
	switch e {
	case GoogleProtobufFieldDescriptorProtoTypeTypeDouble, GoogleProtobufFieldDescriptorProtoTypeTypeFloat, GoogleProtobufFieldDescriptorProtoTypeTypeInt64, GoogleProtobufFieldDescriptorProtoTypeTypeUint64, GoogleProtobufFieldDescriptorProtoTypeTypeInt32, GoogleProtobufFieldDescriptorProtoTypeTypeFixed64, GoogleProtobufFieldDescriptorProtoTypeTypeFixed32, GoogleProtobufFieldDescriptorProtoTypeTypeBool, GoogleProtobufFieldDescriptorProtoTypeTypeString, GoogleProtobufFieldDescriptorProtoTypeTypeGroup, GoogleProtobufFieldDescriptorProtoTypeTypeMessage, GoogleProtobufFieldDescriptorProtoTypeTypeBytes, GoogleProtobufFieldDescriptorProtoTypeTypeUint32, GoogleProtobufFieldDescriptorProtoTypeTypeEnum, GoogleProtobufFieldDescriptorProtoTypeTypeSfixed32, GoogleProtobufFieldDescriptorProtoTypeTypeSfixed64, GoogleProtobufFieldDescriptorProtoTypeTypeSint32, GoogleProtobufFieldDescriptorProtoTypeTypeSint64:
		return true
	}
	return false
}

func (e GoogleProtobufFieldDescriptorProtoType) String() string {
	return string(e)
}

func (e *GoogleProtobufFieldDescriptorProtoType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufFieldDescriptorProtoType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufFieldDescriptorProtoType", str)
	}
	return nil
}

func (e GoogleProtobufFieldDescriptorProtoType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufFieldOptionsCtype string

const (
	GoogleProtobufFieldOptionsCtypeString      GoogleProtobufFieldOptionsCtype = "STRING"
	GoogleProtobufFieldOptionsCtypeCord        GoogleProtobufFieldOptionsCtype = "CORD"
	GoogleProtobufFieldOptionsCtypeStringPiece GoogleProtobufFieldOptionsCtype = "STRING_PIECE"
)

func (e GoogleProtobufFieldOptionsCtype) IsValid() bool {
	switch e {
	case GoogleProtobufFieldOptionsCtypeString, GoogleProtobufFieldOptionsCtypeCord, GoogleProtobufFieldOptionsCtypeStringPiece:
		return true
	}
	return false
}

func (e GoogleProtobufFieldOptionsCtype) String() string {
	return string(e)
}

func (e *GoogleProtobufFieldOptionsCtype) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufFieldOptionsCtype(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufFieldOptionsCType", str)
	}
	return nil
}

func (e GoogleProtobufFieldOptionsCtype) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufFieldOptionsJstype string

const (
	GoogleProtobufFieldOptionsJstypeJsNormal GoogleProtobufFieldOptionsJstype = "JS_NORMAL"
	GoogleProtobufFieldOptionsJstypeJsString GoogleProtobufFieldOptionsJstype = "JS_STRING"
	GoogleProtobufFieldOptionsJstypeJsNumber GoogleProtobufFieldOptionsJstype = "JS_NUMBER"
)

func (e GoogleProtobufFieldOptionsJstype) IsValid() bool {
	switch e {
	case GoogleProtobufFieldOptionsJstypeJsNormal, GoogleProtobufFieldOptionsJstypeJsString, GoogleProtobufFieldOptionsJstypeJsNumber:
		return true
	}
	return false
}

func (e GoogleProtobufFieldOptionsJstype) String() string {
	return string(e)
}

func (e *GoogleProtobufFieldOptionsJstype) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufFieldOptionsJstype(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufFieldOptionsJSType", str)
	}
	return nil
}

func (e GoogleProtobufFieldOptionsJstype) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufFileOptionsOptimizeMode string

const (
	GoogleProtobufFileOptionsOptimizeModeSpeed       GoogleProtobufFileOptionsOptimizeMode = "SPEED"
	GoogleProtobufFileOptionsOptimizeModeCodeSize    GoogleProtobufFileOptionsOptimizeMode = "CODE_SIZE"
	GoogleProtobufFileOptionsOptimizeModeLiteRuntime GoogleProtobufFileOptionsOptimizeMode = "LITE_RUNTIME"
)

func (e GoogleProtobufFileOptionsOptimizeMode) IsValid() bool {
	switch e {
	case GoogleProtobufFileOptionsOptimizeModeSpeed, GoogleProtobufFileOptionsOptimizeModeCodeSize, GoogleProtobufFileOptionsOptimizeModeLiteRuntime:
		return true
	}
	return false
}

func (e GoogleProtobufFileOptionsOptimizeMode) String() string {
	return string(e)
}

func (e *GoogleProtobufFileOptionsOptimizeMode) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufFileOptionsOptimizeMode(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufFileOptionsOptimizeMode", str)
	}
	return nil
}

func (e GoogleProtobufFileOptionsOptimizeMode) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}

type GoogleProtobufMethodOptionsIdempotencyLevel string

const (
	GoogleProtobufMethodOptionsIdempotencyLevelIdempotencyUnknown GoogleProtobufMethodOptionsIdempotencyLevel = "IDEMPOTENCY_UNKNOWN"
	GoogleProtobufMethodOptionsIdempotencyLevelNoSideEffects      GoogleProtobufMethodOptionsIdempotencyLevel = "NO_SIDE_EFFECTS"
	GoogleProtobufMethodOptionsIdempotencyLevelIdempotent         GoogleProtobufMethodOptionsIdempotencyLevel = "IDEMPOTENT"
)

func (e GoogleProtobufMethodOptionsIdempotencyLevel) IsValid() bool {
	switch e {
	case GoogleProtobufMethodOptionsIdempotencyLevelIdempotencyUnknown, GoogleProtobufMethodOptionsIdempotencyLevelNoSideEffects, GoogleProtobufMethodOptionsIdempotencyLevelIdempotent:
		return true
	}
	return false
}

func (e GoogleProtobufMethodOptionsIdempotencyLevel) String() string {
	return string(e)
}

func (e *GoogleProtobufMethodOptionsIdempotencyLevel) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = GoogleProtobufMethodOptionsIdempotencyLevel(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid GoogleProtobufMethodOptionsIdempotencyLevel", str)
	}
	return nil
}

func (e GoogleProtobufMethodOptionsIdempotencyLevel) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
