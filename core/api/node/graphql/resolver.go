//go:generate gorunpkg github.com/99designs/gqlgen

package graphql

import (
	"context"
	"errors"
	"fmt"
	"io"

	"go.uber.org/zap"

	service "berty.tech/core/api/node"
	"berty.tech/core/api/node/graphql/graph"
	"berty.tech/core/api/node/graphql/model"
	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

type Resolver struct {
	client service.ServiceClient
}

func New(client service.ServiceClient) graph.Config {
	return graph.Config{
		Resolvers: &Resolver{client},
	}
}

func (r *Resolver) Mutation() graph.MutationResolver {
	return &mutationResolver{r}
}

func (r *Resolver) Query() graph.QueryResolver {
	return &queryResolver{r}
}

func (r *Resolver) Subscription() graph.SubscriptionResolver {
	return &subscriptionResolver{r}
}

type mutationResolver struct{ *Resolver }

func (r *mutationResolver) ContactRequest(ctx context.Context, input model.ContactRequestInput) (*model.ContactRequestPayload, error) {
	// @TODO: Find a way to properly handle defaults values
	if input.IntroText == nil {
		tmp := "Hi, I'd like to add you to my professional network on Berty"
		input.IntroText = &tmp
	}

	var contactGlobalID globalID
	err := contactGlobalID.FromString(input.ContactID)
	if err != nil {
		return nil, err
	}

	req := &service.ContactRequestInput{
		Contact: &entity.Contact{
			ID: contactGlobalID.ID,
		},
		IntroText: *input.IntroText,
	}

	contact, err := r.client.ContactRequest(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ContactRequestPayload{
		BertyEntityContact: convertContact(contact),
		ClientMutationID:   input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ContactAcceptRequest(ctx context.Context, input model.ContactAcceptRequestInput) (*model.ContactAcceptRequestPayload, error) {
	// @TODO: Find a way to properly handle defaults values
	var contactGlobalID globalID
	err := contactGlobalID.FromString(input.ContactID)
	if err != nil {
		return nil, err
	}

	req := &entity.Contact{
		ID: contactGlobalID.ID,
	}

	contact, err := r.client.ContactAcceptRequest(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ContactAcceptRequestPayload{
		BertyEntityContact: convertContact(contact),
		ClientMutationID:   input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ContactRemove(ctx context.Context, input model.ContactRemoveInput) (*model.ContactRemovePayload, error) {
	var contactGlobalID globalID
	err := contactGlobalID.FromString(input.ContactID)
	if err != nil {
		return nil, err
	}

	req := &entity.Contact{
		ID: contactGlobalID.ID,
	}

	contact, err := r.client.ContactRemove(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ContactRemovePayload{
		BertyEntityContact: convertContact(contact),
		ClientMutationID:   input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ContactUpdate(ctx context.Context, input model.ContactUpdateInput) (*model.ContactUpdatePayload, error) {
	if input.DisplayName == nil {
		return nil, errors.New("contact update without a displayName is not currently supported")
	}

	var contactGlobalID globalID
	err := contactGlobalID.FromString(input.ContactID)
	if err != nil {
		return nil, err
	}

	req := entity.Contact{
		ID:          contactGlobalID.ID,
		DisplayName: *input.DisplayName,
	}

	contact, err := r.client.ContactUpdate(ctx, &req)
	if err != nil {
		return nil, err
	}

	return &model.ContactUpdatePayload{
		BertyEntityContact: convertContact(contact),
		ClientMutationID:   input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ConversationCreate(ctx context.Context, input model.ConversationCreateInput) (*model.ConversationCreatePayload, error) {
	membersID := make([]string, len(input.ContactsID))
	for i, cid := range input.ContactsID {
		gid := globalID{}
		err := gid.FromString(cid)
		if err != nil {
			return nil, err
		}

		membersID[i] = gid.ID
	}

	members, err := memberSliceFromContactIds(input.ContactsID)
	if err != nil {
		return nil, err
	}

	req := &entity.Conversation{
		Members: members,
	}

	conversation, err := r.client.ConversationCreate(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ConversationCreatePayload{
		BertyEntityConversation: convertConversation(conversation),
		ClientMutationID:        input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ConversationInvite(ctx context.Context, input model.ConversationInviteInput) (*model.ConversationInvitePayload, error) {
	var conversationGlobalID globalID
	err := conversationGlobalID.FromString(input.ConversationID)
	if err != nil {
		return nil, err
	}

	members, err := memberSliceFromContactIds(input.ContactsID)
	if err != nil {
		return nil, err
	}

	req := &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: conversationGlobalID.ID,
		},
		Members: members,
	}

	conversation, err := r.client.ConversationInvite(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ConversationInvitePayload{
		BertyEntityConversation: convertConversation(conversation),
		ClientMutationID:        input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ConversationExclude(ctx context.Context, input model.ConversationExcludeInput) (*model.ConversationExcludePayload, error) {
	var conversationGlobalID globalID
	err := conversationGlobalID.FromString(input.ConversationID)
	if err != nil {
		return nil, err
	}

	members, err := memberSliceFromContactIds(input.ContactsID)
	if err != nil {
		return nil, err
	}

	req := &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: input.ConversationID,
		},
		Members: members,
	}

	conversation, err := r.client.ConversationExclude(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ConversationExcludePayload{
		BertyEntityConversation: convertConversation(conversation),
		ClientMutationID:        input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) ConversationAddMessage(ctx context.Context, input model.ConversationAddMessageInput) (*model.ConversationAddMessagePayload, error) {
	var conversationGlobalID globalID
	err := conversationGlobalID.FromString(input.ConversationID)
	if err != nil {
		return nil, err
	}

	req := &service.ConversationAddMessageInput{
		Conversation: &entity.Conversation{
			ID: conversationGlobalID.ID,
		},
		Message: &entity.Message{
			Text: input.Message,
		},
	}

	event, err := r.client.ConversationAddMessage(ctx, req)
	if err != nil {
		return nil, err
	}

	return &model.ConversationAddMessagePayload{
		BertyP2pEvent:    convertEvent(event),
		ClientMutationID: input.ClientMutationID,
	}, nil
}

func (r *mutationResolver) GenerateFakeData(ctx context.Context, input model.GenerateFakeDataInput) (*model.GenerateFakeDataPayload, error) {
	req := &service.Void{}

	_, err := r.client.GenerateFakeData(ctx, req)
	if err != nil {
		return nil, err
	}
	return &model.GenerateFakeDataPayload{
		BertyNodeVoid:    &model.BertyNodeVoid{},
		ClientMutationID: input.ClientMutationID,
	}, err
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Node(ctx context.Context, id string) (model.Node, error) {
	var gid globalID
	if err := gid.FromString(id); err != nil {
		return nil, err
	}

	switch gid.Kind {
	case EventKind:
		return r.GetEvent(ctx, id)
	case ContactKind:
		return r.GetContact(ctx, id)
	case ConversationKind:
		return r.GetConversation(ctx, id)
	case ConversationMemberKind:
		return r.GetConversationMember(ctx, id)
	}

	return nil, fmt.Errorf("`%s:%s` unknown kind (%s)", string(gid.Kind), gid.ID, string(gid.Kind))
}

func (r *queryResolver) EventList(ctx context.Context, limit *int, kind *model.BertyP2pKind, conversationID *string) ([]*model.BertyP2pEvent, error) {

	var conversationGID globalID
	if conversationID != nil {
		if err := conversationGID.FromString(*conversationID); err != nil {
			return nil, err
		}
	}

	req := &service.EventListInput{}
	if limit != nil {
		req.Limit = uint32(*limit)
	}

	stream, err := r.client.EventList(ctx, req)
	if err != nil {
		return nil, err
	}

	var entries []*model.BertyP2pEvent
	for {
		entry, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		c := convertEvent(entry)
		entries = append(entries, c)
	}

	return entries, nil
}

func (r *queryResolver) GetEvent(ctx context.Context, eventID string) (*model.BertyP2pEvent, error) {
	var gid globalID
	if err := gid.FromString(eventID); err != nil {
		return nil, err
	}

	req := &p2p.Event{
		ID: gid.ID,
	}

	event, err := r.client.GetEvent(ctx, req)
	if err != nil {
		return nil, err
	}

	return convertEvent(event), err
}

func (r *queryResolver) ContactList(ctx context.Context) ([]*model.BertyEntityContact, error) {
	req := &service.Void{}
	stream, err := r.client.ContactList(ctx, req)
	if err != nil {
		return nil, err
	}

	var entries []*model.BertyEntityContact
	for {
		entry, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		c := convertContact(entry)
		entries = append(entries, c)
	}

	return entries, nil
}

func (r *queryResolver) GetContact(ctx context.Context, contactID string) (*model.BertyEntityContact, error) {
	var gid globalID
	if err := gid.FromString(contactID); err != nil {
		return nil, err
	}

	req := &entity.Contact{
		ID: gid.ID,
	}

	contact, err := r.client.GetContact(ctx, req)
	if err != nil {
		return nil, err
	}

	return convertContact(contact), err
}

func (r *queryResolver) GetConversation(ctx context.Context, conversationID string) (*model.BertyEntityConversation, error) {
	var gid globalID
	if err := gid.FromString(conversationID); err != nil {
		return nil, err
	}

	req := &entity.Conversation{
		ID: gid.ID,
	}

	conversation, err := r.client.GetConversation(ctx, req)
	if err != nil {
		return nil, err
	}

	return convertConversation(conversation), err
}

func (r *queryResolver) ConversationList(ctx context.Context) ([]*model.BertyEntityConversation, error) {
	req := &service.Void{}
	stream, err := r.client.ConversationList(ctx, req)
	if err != nil {
		return nil, err
	}

	var entries []*model.BertyEntityConversation
	for {
		entry, err := stream.Recv()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		c := convertConversation(entry)
		entries = append(entries, c)
	}

	return entries, nil
}

func (r *queryResolver) GetConversationMember(ctx context.Context, conversationMemberID string) (*model.BertyEntityConversationMember, error) {
	var gid globalID
	if err := gid.FromString(conversationMemberID); err != nil {
		return nil, err
	}

	req := &entity.ConversationMember{
		ID: gid.ID,
	}

	conversationMember, err := r.client.GetConversationMember(ctx, req)
	if err != nil {
		return nil, err
	}

	return convertConversationMember(conversationMember), err
}

type subscriptionResolver struct{ *Resolver }

func (r *subscriptionResolver) EventStream(ctx context.Context, kind *string, conversationID *string) (<-chan *model.BertyP2pEvent, error) {
	ce := make(chan *model.BertyP2pEvent)

	req := &service.EventStreamInput{}
	if kind != nil || conversationID != nil {
		req.Filter = &p2p.Event{
			// Kind: , @TODO: need converter for kind filter
			ConversationID: *conversationID,
		}
	}

	stream, err := r.client.EventStream(ctx, req)
	if err != nil {
		return nil, err
	}

	go func() {
		for {
			entry, err := stream.Recv()

			// if err == io.EOF {
			//      break
			// }

			if err != nil {
				logger().Error("EventStream error", zap.Error(err))
				break
			}

			ce <- convertEvent(entry)
		}
	}()

	return ce, nil
}
