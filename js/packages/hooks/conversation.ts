import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { chat } from '@berty-tech/store'
import { useAccount, useClient } from './account'

// conversations commands
export const useConversationGenerate = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.conversation.commands.generate()), [dispatch])
}

type UseConversationCreate = (kwargs: {
	members: chat.contact.Entity[]
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
			dispatch(chat.conversation.commands.create({ accountId: account.id, name, members }))
		}
	}, [account, dispatch, members, name])
}

export const useConversationDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.conversation.Command.Delete) =>
			dispatch(chat.conversation.commands.delete(payload)),
		[dispatch],
	)
}

export const useStartReadConversation = (id: chat.conversation.Entity['id']) => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.conversation.commands.startRead(id)), [dispatch, id])
}

export const useStopReadConversation = (id: chat.conversation.Entity['id']) => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.conversation.commands.stopRead(id)), [dispatch, id])
}

// conversation queries
export const useConversationList = () => {
	const client = useClient()
	// TODO: handle multiple devices
	const list = useSelector((state: chat.conversation.GlobalState) =>
		client
			? chat.conversation.queries
					.list(state)
					.filter(
						(conv) =>
							conv.kind === 'fake' ||
							Object.keys(conv.membersDevices).filter((m) => m !== client.accountPk).length > 0,
					)
			: [],
	)
	return list
}

export const useConversationLength = () => {
	return useConversationList().length
}

export const useGetConversation = (id: string): chat.conversation.Entity | undefined => {
	const conversation = useSelector((state: chat.conversation.GlobalState) =>
		chat.conversation.queries.get(state, { id }),
	)
	return conversation
}

export const useOneToOneConversationContact = (id: string): chat.contact.Entity | undefined => {
	const conversation = useGetConversation(id)
	return useSelector(
		(state: chat.contact.GlobalState) =>
			(conversation?.kind === chat.conversation.ConversationKind.OneToOne &&
				chat.contact.queries.get(state, { id: conversation.contactId })) ||
			undefined,
	)
}
