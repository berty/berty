package messengertypes

type serviceEventHandlerPostActionsNoop struct{}

func NewPostActionsServiceNoop() EventHandlerPostActions {
	return &serviceEventHandlerPostActionsNoop{}
}

func (p *serviceEventHandlerPostActionsNoop) ConversationJoined(conversation *Conversation) error {
	return nil
}

func (p serviceEventHandlerPostActionsNoop) ContactConversationJoined(contact *Contact) error {
	return nil
}

func (p *serviceEventHandlerPostActionsNoop) InteractionReceived(i *Interaction) error {
	return nil
}

func (p *serviceEventHandlerPostActionsNoop) PushServerOrTokenRegistered(account *Account) error {
	return nil
}
