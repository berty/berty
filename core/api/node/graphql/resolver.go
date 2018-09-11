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

func (r *mutationResolver) ContactRequest(ctx context.Context, contactID string, introText *string) (*model.BertyEntityContact, error) {
	// @TODO: Find a way to properly handle defaults values
	if introText == nil {
		tmp := "Hi, I'd like to add you to my professional network on Berty"
		introText = &tmp
	}

	req := &service.ContactRequestInput{
		Contact: &entity.Contact{
			ID: contactID,
		},
		IntroText: *introText,
	}

	return convertContact(r.client.ContactRequest(ctx, req))
}

func (r *mutationResolver) ContactRemove(ctx context.Context, contactID string) (*model.BertyEntityContact, error) {
	req := &entity.Contact{
		ID: contactID,
	}

	return convertContact(r.client.ContactRemove(ctx, req))
}

func (r *mutationResolver) ContactUpdate(ctx context.Context, contactID string, displayName *string) (*model.BertyEntityContact, error) {
	if displayName == nil {
		return nil, errors.New("contact update without a displayName is not currently supported")
	}

	contact := entity.Contact{
		ID:          contactID,
		DisplayName: *displayName,
	}

	return convertContact(r.client.ContactUpdate(ctx, &contact))
}
func (r *mutationResolver) ConversationCreate(ctx context.Context, contactsID []string) (*model.BertyEntityConversation, error) {
	return convertConversation(r.client.ConversationCreate(ctx, &entity.Conversation{
		Members: memberSliceFromContactIds(contactsID),
	}))
}

func (r *mutationResolver) ConversationInvite(ctx context.Context, conversationID string, contactsID []string) (*model.BertyEntityConversation, error) {
	return convertConversation(r.client.ConversationInvite(ctx, &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: conversationID,
		},
		Members: memberSliceFromContactIds(contactsID),
	}))
}
func (r *mutationResolver) ConversationExclude(ctx context.Context, conversationID string, contactsID []string) (*model.BertyEntityConversation, error) {
	return convertConversation(r.client.ConversationExclude(ctx, &service.ConversationManageMembersInput{
		Conversation: &entity.Conversation{
			ID: conversationID,
		},
		Members: memberSliceFromContactIds(contactsID),
	}))
}
func (r *mutationResolver) ConversationAddMessage(ctx context.Context, conversationID string, message string) (*model.BertyP2pEvent, error) {
	return convertEvent(r.client.ConversationAddMessage(ctx, &service.ConversationAddMessageInput{
		Conversation: &entity.Conversation{
			ID: conversationID,
		},
		Message: &entity.Message{
			Text: message,
		},
	}))
}

func (r *mutationResolver) GenerateFakeData(ctx context.Context) (*model.BertyNodeVoid, error) {
	_, err := r.client.GenerateFakeData(ctx, &service.Void{})
	return &model.BertyNodeVoid{}, err
}

type queryResolver struct{ *Resolver }

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

		c, _ := convertEvent(entry, nil)
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

		c, _ := convertContact(entry, nil)
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

		c, _ := convertConversation(entry, nil)
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
