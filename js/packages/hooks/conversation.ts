import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { messenger } from '@berty-tech/store'
import { useAccount, useClient } from './account'
import { useAccountContacts } from './contact'
import { useGroups } from './Groups'

// conversations commands
export const useConversationGenerate = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.conversation.commands.generate()), [dispatch])
}

type UseConversationCreate = (kwargs: {
	members: messenger.contact.Entity[]
	name: string
}) => () => void

// multimember group
export const useConversationCreate: UseConversationCreate = ({ name, members }) => {
	const account = useAccount()
	const dispatch = useDispatch()
	return useMemo(() => {
		if (!account) {
			return () => {}
		}
		return () => {
			dispatch(messenger.conversation.commands.create({ name, members }))
		}
	}, [account, dispatch, members, name])
}

export const useConversationJoin = ({ link }: { link: string }) => {
	const dispatch = useDispatch()
	return useMemo(() => {
		return () => {
			dispatch(messenger.conversation.commands.join({ link }))
		}
	}, [dispatch, link])
}

export const useConversationDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.conversation.Command.Delete) =>
			dispatch(messenger.conversation.commands.delete(payload)),
		[dispatch],
	)
}

export const useStartReadConversation = (id: messenger.conversation.Entity['id']) => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.conversation.commands.startRead(id)), [
		dispatch,
		id,
	])
}

export const useStopReadConversation = (id: messenger.conversation.Entity['id']) => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.conversation.commands.stopRead(id)), [dispatch, id])
}

// conversation queries

export const useAllConversations = () => {
	const client = useClient()
	// TODO: handle multiple devices
	const list = useSelector((state: messenger.conversation.GlobalState) =>
		client ? messenger.conversation.queries.list(state) : [],
	)
	return list
}

export const useConversationList = () => {
	const client = useClient()
	const groups = useGroups()
	const contacts = useAccountContacts()
	// TODO: handle multiple devices
	const list = useSelector((state: messenger.conversation.GlobalState) =>
		client
			? messenger.conversation.queries.list(state).filter((conv) => {
					const { membersDevices } = groups[conv.pk] || { membersDevices: {} }
					const contact =
						conv.kind === messenger.conversation.ConversationKind.OneToOne &&
						contacts.find((c) => c.id === conv.contactId)
					return (
						conv.kind === 'fake' ||
						conv.kind === messenger.conversation.ConversationKind.MultiMember ||
						(contact &&
							contact.request.type === messenger.contact.ContactRequestType.Incoming &&
							contact.request.accepted) ||
						Object.keys(membersDevices).filter((m) => m !== client.accountPk).length > 0
					)
			  })
			: [],
	)
	return list
}

export const useConversationLength = () => {
	return useConversationList().length
}

export const useGetConversation = (id: string): messenger.conversation.Entity | undefined => {
	const conversation = useSelector((state: messenger.conversation.GlobalState) =>
		messenger.conversation.queries.get(state, { id }),
	)
	return conversation
}

export const useOneToOneConversationContact = (
	id: string,
): messenger.contact.Entity | undefined => {
	const conversation = useGetConversation(id)
	return useSelector(
		(state: messenger.contact.GlobalState) =>
			(conversation?.kind === messenger.conversation.ConversationKind.OneToOne &&
				messenger.contact.queries.get(state, { id: conversation.contactId })) ||
			undefined,
	)
}

// search hooks

/**
 * Maybe not ideal, as we have already searched contacts
 * and could have returned conversation with them at the same time
 */
export const useFirstConversationWithContact = (
	contactPk: string,
): messenger.conversation.Entity | null => {
	const conversations = useConversationList()
	const groups = useGroups()
	const conversationWithContact = useMemo(
		() =>
			conversations.find((conv) => {
				const { membersDevices } = groups[conv.pk] || { membersDevices: {} }
				return (
					conv?.kind === messenger.conversation.ConversationKind.OneToOne &&
					Object.keys(membersDevices || {}).includes(contactPk)
				)
			}) || null,
		[contactPk, conversations, groups],
	)
	return !contactPk ? null : conversationWithContact
}

/**
 * Not used yet, but we can maybe use it to search for groups, not just contacts
 * (problem is, it won't show contacts without conversation or group)
 */
export const useSearchConversationsByTitle = (searchText: string): any => {
	const conversationSelector = (state: messenger.conversation.GlobalState) =>
		messenger.conversation.queries.searchByTitle(state, { searchText })
	const conversations = useSelector(conversationSelector)
	return conversations
}
