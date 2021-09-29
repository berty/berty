package messengertypes

type EventHandlerPostActions interface {
	ConversationJoined(conversation *Conversation) error
	ContactConversationJoined(contact *Contact) error
	InteractionReceived(i *Interaction) error
	PushServerOrTokenRegistered(account *Account) error
}
