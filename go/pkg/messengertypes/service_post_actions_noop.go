package messengertypes

type serviceEventHandlerPostActionsNoop struct{}

func NewPostActionsServiceNoop() EventHandlerPostActions {
	return &serviceEventHandlerPostActionsNoop{}
}

//nolint:revive
func (p *serviceEventHandlerPostActionsNoop) ConversationJoined(conversation *Conversation) error {
	return nil
}

//nolint:revive
func (p serviceEventHandlerPostActionsNoop) ContactConversationJoined(contact *Contact) error {
	return nil
}

//nolint:revive
func (p *serviceEventHandlerPostActionsNoop) InteractionReceived(i *Interaction) error {
	return nil
}

//nolint:revive
func (p *serviceEventHandlerPostActionsNoop) PushServerOrTokenRegistered(account *Account) error {
	return nil
}
