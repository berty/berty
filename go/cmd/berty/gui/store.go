package gui

import (
	"context"
	"io"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// TYPES

type accountUpdateHandler = func(*messengertypes.Account) error

type (
	contactMap           = map[string]*messengertypes.Contact
	contactUpdateHandler = func(*messengertypes.Contact) error
)

type (
	conversationMap           = map[string]*messengertypes.Conversation
	conversationUpdateHandler = func(*messengertypes.Conversation) error
	conversationHandlerMap    = map[*conversationUpdateHandler]struct{}
)

type (
	interactionMap           = map[string]map[string]*messengertypes.Interaction
	interactionUpdateHandler = func(*messengertypes.Interaction) error
)

type (
	memberMap           = map[string]map[string]*messengertypes.Member
	memberUpdateHandler = func(*messengertypes.Member) error
	memberHandlerMap    = map[string]map[*memberUpdateHandler]struct{}
)

type msgrStore struct {
	handlersMu *sync.RWMutex

	account         *messengertypes.Account
	accountHandlers map[*accountUpdateHandler]struct{}

	contacts        contactMap
	contactHandlers map[*contactUpdateHandler]struct{}

	conversations                conversationMap
	conversationHandlers         conversationHandlerMap
	specificConversationHandlers map[string]conversationHandlerMap

	members                memberMap
	memberHandlers         memberHandlerMap
	specificMemberHandlers map[string]memberHandlerMap

	interactions        interactionMap
	interactionHandlers map[string]map[*interactionUpdateHandler]struct{}

	cancelEventStream func()
	logger            *zap.Logger
}

// CTOR

func newMsgrStore(ctx context.Context, client messengertypes.MessengerServiceClient, logger *zap.Logger) (*msgrStore, error) {
	esCtx, esCancel := context.WithCancel(ctx)
	store := msgrStore{
		cancelEventStream: esCancel,

		logger:     logger,
		handlersMu: &sync.RWMutex{},

		accountHandlers: make(map[*accountUpdateHandler]struct{}),

		contacts:        make(contactMap),
		contactHandlers: make(map[*contactUpdateHandler]struct{}),

		conversations:                make(conversationMap),
		conversationHandlers:         make(conversationHandlerMap),
		specificConversationHandlers: make(map[string]conversationHandlerMap),

		interactions:        make(interactionMap),
		interactionHandlers: make(map[string]map[*interactionUpdateHandler]struct{}),

		members:                make(memberMap),
		memberHandlers:         make(map[string]map[*memberUpdateHandler]struct{}),
		specificMemberHandlers: make(map[string]map[string]map[*memberUpdateHandler]struct{}),
	}
	es, err := client.EventStream(esCtx, &messengertypes.EventStream_Request{})
	if err != nil {
		return nil, err
	}
	go func() {
		for {
			msg, err := es.Recv()
			if err == io.EOF {
				store.logger.Debug("EventStream EOF")
				return
			}
			if err != nil {
				store.logger.Error("EventStream error", zap.Error(err))
				return
			}
			store.handleEvent(msg.GetEvent())
		}
	}()
	return &store, nil
}

// SUBSCRIBE

func (store *msgrStore) accountSubscribe(callback accountUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.accountHandlers[&callback]; !ok {
			store.accountHandlers[&callback] = struct{}{}
			if account := store.account; account != nil {
				store.logIfError("accountSubscribe handler", (callback)(account))
			}
		}
	}, func() {
		delete(store.accountHandlers, &callback)
	})
}

func (store *msgrStore) contactListSubscribe(callback contactUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.contactHandlers[&callback]; !ok {
			store.contactHandlers[&callback] = struct{}{}
			for _, c := range store.contacts {
				store.logIfError("contactListSubscribe handler", callback(c))
			}
		}
	}, func() {
		delete(store.contactHandlers, &callback)
	})
}

func (store *msgrStore) conversationListSubscribe(callback conversationUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.conversationHandlers[&callback]; !ok {
			store.conversationHandlers[&callback] = struct{}{}
			for _, c := range store.conversations {
				store.logIfError("conversationListSubscribe handler", callback(c))
			}
		}
	}, func() {
		delete(store.conversationHandlers, &callback)
	})
}

func (store *msgrStore) conversationSubscribe(convPK string, callback conversationUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.specificConversationHandlers[convPK]; !ok {
			store.specificConversationHandlers[convPK] = make(conversationHandlerMap)
		}
		if _, ok := store.specificConversationHandlers[convPK][&callback]; !ok {
			store.specificConversationHandlers[convPK][&callback] = struct{}{}
			if conv, ok := store.conversations[convPK]; ok {
				store.logIfError("conversationSubscribe handler", callback(conv))
			}
		}
	}, func() {
		delete(store.specificConversationHandlers[convPK], &callback)
		if len(store.specificConversationHandlers[convPK]) == 0 {
			delete(store.specificConversationHandlers, convPK)
		}
	})
}

func (store *msgrStore) interactionListSubscribe(convPK string, callback interactionUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.interactionHandlers[convPK]; !ok {
			store.interactionHandlers[convPK] = make(map[*interactionUpdateHandler]struct{})
		}
		if _, ok := store.interactionHandlers[convPK][&callback]; !ok {
			store.interactionHandlers[convPK][&callback] = struct{}{}
			for _, inte := range store.interactions[convPK] {
				if callback != nil {
					store.logIfError("interactionListSubscribe handler", callback(inte))
				}
			}
		}
	}, func() {
		delete(store.interactionHandlers[convPK], &callback)
		if len(store.interactionHandlers[convPK]) == 0 {
			delete(store.interactionHandlers, convPK)
		}
	})
}

func (store *msgrStore) memberListSubscribe(convPK string, callback memberUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.memberHandlers[convPK]; !ok {
			store.memberHandlers[convPK] = make(map[*memberUpdateHandler]struct{})
		}
		if _, ok := store.memberHandlers[convPK][&callback]; !ok {
			store.memberHandlers[convPK][&callback] = struct{}{}
			for _, member := range store.members[convPK] {
				m := member
				if callback != nil {
					store.logIfError("memberListSubscribe handler", callback(m))
				}
			}
		}
	}, func() {
		delete(store.memberHandlers[convPK], &callback)
		if len(store.memberHandlers[convPK]) == 0 {
			delete(store.memberHandlers, convPK)
		}
	})
}

func (store *msgrStore) logIfError(prefix string, err error) {
	if err != nil {
		store.logger.Error(prefix, zap.Error(err))
	}
}

func (store *msgrStore) memberSubscribe(convPK string, memberPK string, callback memberUpdateHandler) func() error {
	return store.subscribe(func() {
		if _, ok := store.specificMemberHandlers[convPK]; !ok {
			store.specificMemberHandlers[convPK] = make(memberHandlerMap)
		}
		if _, ok := store.specificMemberHandlers[convPK][memberPK]; !ok {
			store.specificMemberHandlers[convPK][memberPK] = make(map[*memberUpdateHandler]struct{})
		}
		if _, ok := store.specificMemberHandlers[convPK][memberPK][&callback]; !ok {
			store.specificMemberHandlers[convPK][memberPK][&callback] = struct{}{}
			if convMembers, ok := store.members[convPK]; ok {
				if member, ok := convMembers[memberPK]; ok {
					store.logIfError("memberSubscribe handler", callback(member))
				}
			}
		}
	}, func() {
		if _, ok := store.specificMemberHandlers[convPK]; ok {
			delete(store.specificMemberHandlers[convPK][memberPK], &callback)
			if len(store.specificMemberHandlers[convPK][memberPK]) == 0 {
				delete(store.specificMemberHandlers[convPK], memberPK)
				if len(store.specificMemberHandlers[convPK]) == 0 {
					delete(store.specificMemberHandlers, convPK)
				}
			}
		}
	})
}

func (store *msgrStore) conversationNameSubscribe(convPK string, callback func(string) error) func() error {
	unsubContacts := store.contactListSubscribe(func(contact *messengertypes.Contact) error {
		if contact.GetConversationPublicKey() != convPK {
			return nil
		}

		return callback(contact.GetDisplayName())
	})

	unsubConv := store.conversationSubscribe(convPK, func(conv *messengertypes.Conversation) error {
		if conv.GetType() == messengertypes.Conversation_MultiMemberType {
			return callback(conv.GetDisplayName())
		}
		return nil
	})

	return mergeCleaners(unsubContacts, unsubConv)
}

func (store *msgrStore) subscribe(subBlock func(), unsubBlock func()) func() error {
	if store == nil || subBlock == nil {
		return func() error { return nil }
	}

	wg := &sync.WaitGroup{}

	wg.Add(1)
	go func() {
		defer autoLock(store.handlersMu)()
		wg.Done()
		subBlock()
	}()

	if unsubBlock == nil {
		return func() error { return nil }
	}

	return func() error {
		wg.Wait()
		defer autoLock(store.handlersMu)()
		unsubBlock()
		return nil
	}
}

// EVENTS HANDLER

func (store *msgrStore) handleEvent(ev *messengertypes.StreamEvent) {
	msg, err := ev.UnmarshalPayload()
	if err != nil {
		store.logger.Error("failed to unmarshal payload", zap.Error(err))
		return
	}

	defer autoLock(store.handlersMu)()

	switch ev.GetType() {
	case messengertypes.StreamEvent_TypeAccountUpdated:
		account := msg.(*messengertypes.StreamEvent_AccountUpdated).Account
		store.logger.Debug("account update received", zap.Any("account", account))
		store.account = account
		for callback := range store.accountHandlers {
			if callback != nil {
				store.logIfError("account handler", (*callback)(account))
			}
		}
	case messengertypes.StreamEvent_TypeContactUpdated:
		contact := msg.(*messengertypes.StreamEvent_ContactUpdated).Contact
		store.logger.Debug("contact update received", zap.Any("contact", contact))
		store.contacts[contact.GetPublicKey()] = contact
		for callback := range store.contactHandlers {
			if callback != nil {
				store.logIfError("contact handler", (*callback)(contact))
			}
		}
	case messengertypes.StreamEvent_TypeConversationUpdated:
		conversation := msg.(*messengertypes.StreamEvent_ConversationUpdated).Conversation
		store.logger.Debug("conversation update received", zap.Any("conversation", conversation))
		store.conversations[conversation.GetPublicKey()] = conversation
		for callback := range store.specificConversationHandlers[conversation.GetPublicKey()] {
			if callback != nil {
				store.logIfError("specific conv handler", (*callback)(conversation))
			}
		}
		for callback := range store.conversationHandlers {
			if callback != nil {
				store.logIfError("conv handler", (*callback)(conversation))
			}
		}
	case messengertypes.StreamEvent_TypeInteractionUpdated:
		interaction := msg.(*messengertypes.StreamEvent_InteractionUpdated).Interaction
		store.logger.Debug("interaction update received", zap.Any("interaction", interaction))
		if _, ok := store.interactions[interaction.GetConversationPublicKey()]; !ok {
			store.interactions[interaction.GetConversationPublicKey()] = make(map[string]*messengertypes.Interaction)
		}
		store.interactions[interaction.GetConversationPublicKey()][interaction.GetCID()] = interaction
		for callback := range store.interactionHandlers[interaction.GetConversationPublicKey()] {
			if callback != nil {
				store.logIfError("inte handler", (*callback)(interaction))
			}
		}
	case messengertypes.StreamEvent_TypeMemberUpdated:
		member := msg.(*messengertypes.StreamEvent_MemberUpdated).Member
		store.logger.Debug("member update received", zap.Any("member", member))
		convPK := member.GetConversationPublicKey()
		if _, ok := store.members[convPK]; !ok {
			store.members[convPK] = make(map[string]*messengertypes.Member)
		}
		store.members[convPK][member.GetPublicKey()] = member
		for _, callbacks := range store.specificMemberHandlers[convPK] {
			for callback := range callbacks {
				if callback != nil {
					store.logIfError("specific member handler", (*callback)(member))
				}
			}
		}
		for callback := range store.memberHandlers[convPK] {
			if callback != nil {
				store.logIfError("member handler", (*callback)(member))
			}
		}
	default:
		store.logger.Debug("no handler for event", zap.Any("event", ev))
	}
}
