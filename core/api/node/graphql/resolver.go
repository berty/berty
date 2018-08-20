//go:generate gorunpkg github.com/99designs/gqlgen

package graphql

import (
	"context"

	service "github.com/berty/berty/core/api/node"
	"github.com/berty/berty/core/api/node/graphql/graph"
	model "github.com/berty/berty/core/api/node/graphql/models"
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

func (r *mutationResolver) ContactRequest(ctx context.Context, id *string) (*model.BertyEntityContact, error) {
	panic("not implemented")
}
func (r *mutationResolver) ContactRemove(ctx context.Context, id *string) (*model.BertyEntityContact, error) {
	panic("not implemented")
}
func (r *mutationResolver) ContactUpdate(ctx context.Context, id *string) (*model.BertyEntityContact, error) {
	panic("not implemented")
}
func (r *mutationResolver) ConversationCreate(ctx context.Context, id *string) (*model.BertyEntityConversation, error) {
	panic("not implemented")
}
func (r *mutationResolver) ConversationInvite(ctx context.Context, id *string) (*model.BertyEntityConversation, error) {
	panic("not implemented")
}
func (r *mutationResolver) ConversationAddMessage(ctx context.Context, id *string) (*model.BertyP2pEvent, error) {
	panic("not implemented")
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) EventList(ctx context.Context) (*model.BertyP2pEvent, error) {
	panic("not implemented")
}
func (r *queryResolver) ContactList(ctx context.Context) (*model.BertyEntityContact, error) {
	panic("not implemented")
}
func (r *queryResolver) ConversationList(ctx context.Context) (*model.BertyEntityConversation, error) {
	panic("not implemented")
}

type subscriptionResolver struct{ *Resolver }

func (r *subscriptionResolver) EventStream(ctx context.Context) (<-chan *model.BertyP2pEvent, error) {
	panic("not implemented")
}
