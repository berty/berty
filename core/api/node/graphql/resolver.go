package graphql

import (
	context "context"
	json "encoding/json"
	"io"
	"strings"
	time "time"

	node "berty.tech/core/api/node"
	generated "berty.tech/core/api/node/graphql/graph/generated"
	models "berty.tech/core/api/node/graphql/models"
	p2p "berty.tech/core/api/p2p"
	entity "berty.tech/core/entity"
	descriptor "github.com/golang/protobuf/protoc-gen-go/descriptor"
)

type Resolver struct {
	client node.ServiceClient
}

func New(client node.ServiceClient) generated.Config {
	return generated.Config{
		Resolvers: &Resolver{client},
	}
}

func (r *Resolver) BertyEntityContact() generated.BertyEntityContactResolver {
	return &bertyEntityContactResolver{r}
}
func (r *Resolver) BertyEntityContactPayload() generated.BertyEntityContactPayloadResolver {
	return &bertyEntityContactResolver{r}
}
func (r *Resolver) BertyEntityConversation() generated.BertyEntityConversationResolver {
	return &bertyEntityConversationResolver{r}
}
func (r *Resolver) BertyEntityConversationMember() generated.BertyEntityConversationMemberResolver {
	return &bertyEntityConversationMemberResolver{r}
}
func (r *Resolver) BertyEntityConversationMemberPayload() generated.BertyEntityConversationMemberPayloadResolver {
	return &bertyEntityConversationMemberResolver{r}
}
func (r *Resolver) BertyEntityConversationPayload() generated.BertyEntityConversationPayloadResolver {
	return &bertyEntityConversationResolver{r}
}
func (r *Resolver) BertyEntityDevice() generated.BertyEntityDeviceResolver {
	return &bertyEntityDeviceResolver{r}
}
func (r *Resolver) BertyP2pEvent() generated.BertyP2pEventResolver {
	return &bertyP2pEventResolver{r}
}
func (r *Resolver) BertyP2pEventPayload() generated.BertyP2pEventPayloadResolver {
	return &bertyP2pEventResolver{r}
}
func (r *Resolver) GoogleProtobufFieldDescriptorProto() generated.GoogleProtobufFieldDescriptorProtoResolver {
	return &googleProtobufFieldDescriptorProtoResolver{r}
}
func (r *Resolver) GoogleProtobufFieldOptions() generated.GoogleProtobufFieldOptionsResolver {
	return &googleProtobufFieldOptionsResolver{r}
}
func (r *Resolver) GoogleProtobufFileOptions() generated.GoogleProtobufFileOptionsResolver {
	return &googleProtobufFileOptionsResolver{r}
}
func (r *Resolver) GoogleProtobufMethodOptions() generated.GoogleProtobufMethodOptionsResolver {
	return &googleProtobufMethodOptionsResolver{r}
}

func (r *Resolver) Mutation() generated.MutationResolver {
	return &mutationResolver{r}
}
func (r *Resolver) Query() generated.QueryResolver {
	return &queryResolver{r}
}
func (r *Resolver) Subscription() generated.SubscriptionResolver {
	return &subscriptionResolver{r}
}

type bertyEntityContactResolver struct{ *Resolver }

func (r *bertyEntityContactResolver) ID(ctx context.Context, obj *entity.Contact) (string, error) {
	return "contact:" + obj.ID, nil
}

type bertyEntityConversationResolver struct{ *Resolver }

func (r *bertyEntityConversationResolver) ID(ctx context.Context, obj *entity.Conversation) (string, error) {
	return "conversation:" + obj.ID, nil
}

type bertyEntityConversationMemberResolver struct{ *Resolver }

func (r *bertyEntityConversationMemberResolver) ID(ctx context.Context, obj *entity.ConversationMember) (string, error) {
	return "conversation_member:" + obj.ID, nil
}

type bertyEntityDeviceResolver struct{ *Resolver }

func (r *bertyEntityDeviceResolver) ID(ctx context.Context, obj *entity.Device) (string, error) {
	return "device:" + obj.ID, nil
}

type bertyP2pEventResolver struct{ *Resolver }

func (r *bertyP2pEventResolver) ID(ctx context.Context, obj *p2p.Event) (string, error) {
	return "event:" + obj.ID, nil
}
func (r *bertyP2pEventResolver) ConversationID(ctx context.Context, obj *p2p.Event) (string, error) {
	return "conversation:" + obj.ConversationID, nil
}
func (r *bertyP2pEventResolver) Attributes(ctx context.Context, obj *p2p.Event) ([]byte, error) {
	attrs, err := obj.GetAttrs()
	if err != nil {
		return nil, err
	}
	return json.Marshal(attrs)
}

type googleProtobufFieldDescriptorProtoResolver struct{ *Resolver }

func (r *googleProtobufFieldDescriptorProtoResolver) Label(ctx context.Context, obj *descriptor.FieldDescriptorProto) (*int32, error) {
	ret := int32(*obj.Label)
	return &ret, nil
}
func (r *googleProtobufFieldDescriptorProtoResolver) Type(ctx context.Context, obj *descriptor.FieldDescriptorProto) (*int32, error) {
	ret := int32(*obj.Type)
	return &ret, nil
}

type googleProtobufFieldOptionsResolver struct{ *Resolver }

func (r *googleProtobufFieldOptionsResolver) Ctype(ctx context.Context, obj *descriptor.FieldOptions) (*int32, error) {
	ret := int32(*obj.Ctype)
	return &ret, nil
}
func (r *googleProtobufFieldOptionsResolver) Jstype(ctx context.Context, obj *descriptor.FieldOptions) (*int32, error) {
	ret := int32(*obj.Jstype)
	return &ret, nil
}

type googleProtobufFileOptionsResolver struct{ *Resolver }

func (r *googleProtobufFileOptionsResolver) PhpMetadataNamespace(ctx context.Context, obj *descriptor.FileOptions) (string, error) {
	return "", nil
}
func (r *googleProtobufFileOptionsResolver) RubyPackage(ctx context.Context, obj *descriptor.FileOptions) (string, error) {
	return "", nil
}

func (r *googleProtobufFileOptionsResolver) OptimizeFor(ctx context.Context, obj *descriptor.FileOptions) (*int32, error) {
	ret := int32(*obj.OptimizeFor)
	return &ret, nil
}

type googleProtobufMethodOptionsResolver struct{ *Resolver }

func (r *googleProtobufMethodOptionsResolver) IdempotencyLevel(ctx context.Context, obj *descriptor.MethodOptions) (*int32, error) {
	ret := int32(*obj.IdempotencyLevel)
	return &ret, nil
}

type mutationResolver struct{ *Resolver }

func (r *mutationResolver) ContactRequest(ctx context.Context, contact *entity.Contact, introText string) (*entity.Contact, error) {
	// logger().Debug("CONTACT_REQUEST_RESOLVER")
	contact.ID = strings.SplitN(contact.ID, ":", 2)[1]
	return r.client.ContactRequest(ctx, &node.ContactRequestInput{
		Contact:   contact,
		IntroText: introText,
	})
}
func (r *mutationResolver) ContactAcceptRequest(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, sigchain []byte, status *int32, devices []*entity.Device, displayName string, displayStatus string, overrideDisplayName string, overrideDisplayStatus string) (*entity.Contact, error) {
	// logger().Debug("CONTACT_ACCEPT_REQUEST_RESOLVER")
	return r.client.ContactAcceptRequest(ctx, &entity.Contact{
		ID: strings.SplitN(id, ":", 2)[1],
	})
}
func (r *mutationResolver) ContactRemove(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, sigchain []byte, status *int32, devices []*entity.Device, displayName string, displayStatus string, overrideDisplayName string, overrideDisplayStatus string) (*entity.Contact, error) {
	return r.client.ContactRemove(ctx, &entity.Contact{
		ID: strings.SplitN(id, ":", 2)[1],
	})
}
func (r *mutationResolver) ContactUpdate(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, sigchain []byte, status *int32, devices []*entity.Device, displayName string, displayStatus string, overrideDisplayName string, overrideDisplayStatus string) (*entity.Contact, error) {
	return r.client.ContactUpdate(ctx, &entity.Contact{
		ID: strings.SplitN(id, ":", 2)[1],
	})
}
func (r *mutationResolver) ConversationCreate(ctx context.Context, contacts []*entity.Contact, title string, topic string) (*entity.Conversation, error) {
	if contacts != nil {
		for i, contact := range contacts {
			contacts[i].ID = strings.SplitN(contact.ID, ":", 2)[1]
		}
	}
	return r.client.ConversationCreate(ctx, &node.ConversationCreateInput{
		Contacts: contacts,
		Title:    title,
		Topic:    topic,
	})
}
func (r *mutationResolver) ConversationInvite(ctx context.Context, conversation *entity.Conversation, members []*entity.ConversationMember) (*entity.Conversation, error) {

	return r.client.ConversationInvite(ctx, &node.ConversationManageMembersInput{Conversation: conversation, Members: members})
}
func (r *mutationResolver) ConversationExclude(ctx context.Context, conversation *entity.Conversation, members []*entity.ConversationMember) (*entity.Conversation, error) {
	return r.client.ConversationExclude(ctx, &node.ConversationManageMembersInput{Conversation: conversation, Members: members})
}
func (r *mutationResolver) ConversationAddMessage(ctx context.Context, conversation *entity.Conversation, message *entity.Message) (*p2p.Event, error) {
	if conversation != nil {
		if conversation.ID != "" {
			conversation.ID = strings.SplitN(conversation.ID, ":", 2)[1]
		}
	}
	return r.client.ConversationAddMessage(ctx, &node.ConversationAddMessageInput{Conversation: conversation, Message: message})
}
func (r *mutationResolver) GenerateFakeData(ctx context.Context, T bool) (*node.Void, error) {
	return r.client.GenerateFakeData(ctx, &node.Void{T: T})
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Node(ctx context.Context, id string) (models.Node, error) {
	gID := strings.SplitN(id, ":", 2)
	switch gID[0] {
	case "contact":
		return r.client.GetContact(ctx, &entity.Contact{ID: id})
	case "conversation":
		return r.client.GetConversation(ctx, &entity.Conversation{ID: id})
	case "conversation_member":
		return r.client.GetConversationMember(ctx, &entity.ConversationMember{ID: id})
	// case "device":
	// 	return r.client.GetDevice(ctx, &entity.Device{ID: id}onta
	case "event":
		return r.client.GetEvent(ctx, &p2p.Event{ID: id})
	}
	return nil, nil
}
func (r *queryResolver) EventList(ctx context.Context, filter *p2p.Event, paginate *node.Pagination) ([]*p2p.Event, error) {
	var list []*p2p.Event
	if filter != nil {
		if filter.ConversationID != "" {
			filter.ConversationID = strings.SplitN(filter.ConversationID, ":", 2)[1]
		}
	}
	stream, err := r.client.EventList(ctx, &node.EventListInput{Paginate: paginate, Filter: &p2p.Event{
		ConversationID: filter.ConversationID,
	}})
	if err != nil {
		return nil, err
	}
	for {
		elem, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		list = append(list, elem)
	}
	return list, nil
}
func (r *queryResolver) EventListPaginated(ctx context.Context, filter *p2p.Event, paginate *node.Pagination) (*node.EventListOutput, error) {
	if filter != nil && filter.ID != "" {
		filter.ID = strings.SplitN(filter.ID, ":", 2)[1]
	}
	return r.client.EventListPaginated(ctx, &node.EventListInput{Filter: filter, Paginate: paginate})
}
func (r *queryResolver) GetEvent(ctx context.Context, id string, senderID string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, sentAt *time.Time, receivedAt *time.Time, ackedAt *time.Time, direction *int32, senderAPIVersion uint32, receiverAPIVersion uint32, receiverID string, kind *int32, attributes []byte, conversationID string) (*p2p.Event, error) {
	return r.client.GetEvent(ctx, &p2p.Event{
		ID: strings.SplitN(id, ":", 2)[1],
	})
}
func (r *queryResolver) ContactList(ctx context.Context, filter *entity.Contact, paginate *node.Pagination) ([]*entity.Contact, error) {
	if filter != nil && filter.ID != "" {
		filter.ID = strings.SplitN(filter.ID, ":", 2)[1]
	}
	var list []*entity.Contact
	stream, err := r.client.ContactList(ctx, &node.ContactListInput{Filter: filter, Paginate: paginate})
	if err != nil {
		return nil, err
	}
	for {
		elem, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		list = append(list, elem)
	}
	return list, nil
}
func (r *queryResolver) ContactListPaginated(ctx context.Context, filter *entity.Contact, paginate *node.Pagination) (*node.ContactListOutput, error) {
	if filter != nil && filter.ID != "" {
		filter.ID = strings.SplitN(filter.ID, ":", 2)[1]
	}
	return r.client.ContactListPaginated(ctx, &node.ContactListInput{Filter: filter, Paginate: paginate})
}
func (r *queryResolver) GetContact(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, sigchain []byte, status *int32, devices []*entity.Device, displayName string, displayStatus string, overrideDisplayName string, overrideDisplayStatus string) (*entity.Contact, error) {
	return r.client.GetContact(ctx, &entity.Contact{ID: id})
}
func (r *queryResolver) ConversationList(ctx context.Context, filter *entity.Conversation, paginate *node.Pagination) ([]*entity.Conversation, error) {
	var list []*entity.Conversation

	if filter != nil {
		if filter.ID != "" {
			filter.ID = strings.SplitN(filter.ID, ":", 2)[1]
		}
		if filter.Members != nil {
			for _, m := range filter.Members {
				if m.ID != "" {
					m.ID = strings.SplitN(m.ID, ":", 2)[1]
				}
				if m.Contact != nil && m.Contact.ID != "" {
					m.Contact.ID = strings.SplitN(m.Contact.ID, ":", 2)[1]
				}
			}
		}
	}
	stream, err := r.client.ConversationList(ctx, &node.ConversationListInput{Filter: filter, Paginate: paginate})
	if err != nil {
		return nil, err
	}
	for {
		elem, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}
		list = append(list, elem)
	}
	return list, nil
}
func (r *queryResolver) ConversationListPaginated(ctx context.Context, filter *entity.Conversation, paginate *node.Pagination) (*node.ConversationListOutput, error) {
	if filter != nil && filter.ID != "" {
		filter.ID = strings.SplitN(filter.ID, ":", 2)[1]
	}
	return r.client.ConversationListPaginated(ctx, &node.ConversationListInput{Filter: filter, Paginate: paginate})
}
func (r *queryResolver) GetConversation(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, title string, topic string, members []*entity.ConversationMember) (*entity.Conversation, error) {
	return r.client.GetConversation(ctx, &entity.Conversation{ID: id})
}
func (r *queryResolver) GetConversationMember(ctx context.Context, id string, createdAt *time.Time, updatedAt *time.Time, deletedAt *time.Time, status *int32, contact *entity.Contact, conversationID string, contactID string) (*entity.ConversationMember, error) {
	return r.client.GetConversationMember(ctx, &entity.ConversationMember{ID: id})
}

type subscriptionResolver struct{ *Resolver }

func (r *subscriptionResolver) EventStream(ctx context.Context, filter *p2p.Event) (<-chan *p2p.Event, error) {
	stream, err := r.client.EventStream(ctx, &node.EventStreamInput{Filter: filter})
	channel := make(chan *p2p.Event, 1)

	if err != nil {
		return nil, err
	}
	go func() {
		for {
			elem, err := stream.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				// logger().Error(err.Error())
				break
			}
			channel <- elem
		}
	}()
	return channel, nil
}
