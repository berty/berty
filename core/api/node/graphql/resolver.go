//go:generate gorunpkg github.com/99designs/gqlgen

package graphql

import (
	"context"
	"errors"
	"io"

	"go.uber.org/zap"

	service "berty.tech/core/api/node"
	"berty.tech/core/api/node/graphql/graph"
	"berty.tech/core/api/node/graphql/model"
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

	req := &service.ContactRequestInput{
		Contact: &entity.Contact{
			ID: input.ContactID,
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

func (r *mutationResolver) ContactRemove(ctx context.Context, input model.ContactRemoveInput) (*model.ContactRemovePayload, error) {
	req := &entity.Contact{
		ID: input.ContactID,
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

	req := entity.Contact{
		ID:          input.ContactID,
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
	req := &entity.Conversation{
		Members: memberSliceFromContactIds(input.ContactsID),
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
	req := &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: input.ConversationID,
		},
		Members: memberSliceFromContactIds(input.ContactsID),
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
	req := &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: input.ConversationID,
		},
		Members: memberSliceFromContactIds(input.ContactsID),
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
	req := &service.ConversationAddMessageInput{
		Conversation: &entity.Conversation{
			ID: input.ConversationID,
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
	panic("not implemented")
}

func (r *queryResolver) EventList(ctx context.Context, limit *int) ([]*model.BertyP2pEvent, error) {
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

type subscriptionResolver struct{ *Resolver }

func (r *subscriptionResolver) EventStream(ctx context.Context) (<-chan *model.BertyP2pEvent, error) {
	ce := make(chan *model.BertyP2pEvent)
	req := &service.EventStreamInput{}
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

			ret := &model.BertyP2pEvent{
				ID:             &entry.ID,
				SenderID:       &entry.SenderID,
				ConversationID: &entry.ConversationID,
			}

			ce <- ret
		}
	}()

	return ce, nil
}
