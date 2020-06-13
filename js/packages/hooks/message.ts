import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { messenger } from '@berty-tech/store'
import { useGetConversation } from './conversation'

// messages commands
export const useMessageSend = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.message.Command.Send) =>
			dispatch(messenger.message.commands.send(payload)),
		[dispatch],
	)
}

export const useMessageSendToAll = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.message.commands.sendToAll()), [dispatch])
}

export const useMessageHide = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.message.commands.hide()), [dispatch])
}

export const useMessageDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.message.Command.Delete) =>
			dispatch(messenger.message.commands.delete(payload)),
		[dispatch],
	)
}
// messages queries
export const useGetMessage = (id: string): messenger.message.Entity | undefined => {
	const selector = useMemo(
		() => (state: messenger.message.GlobalState) => messenger.message.queries.get(state, { id }),
		[id],
	)
	const message = useSelector(selector)
	return message
}

export const useGetListMessage = (list: any): messenger.message.Entity[] => {
	const selector = useMemo(
		() => (state: messenger.message.GlobalState) =>
			messenger.message.queries.getList(state, { list }),
		[list],
	)
	const messages = useSelector(selector)
	return messages
}

export const useGetDateLastContactMessage = (id: string) => {
	const conversation = useGetConversation(id)
	const messages = useGetListMessage(conversation?.messages)
	if (!(conversation && messages)) {
		return null
	}
	let lastDate
	conversation.kind !== 'fake' &&
		messages.length &&
		messages.map((message) => {
			if (message && message.type === messenger.AppMessageType.UserMessage && !message.isMe) {
				lastDate = message.receivedDate
			}
		})
	return lastDate || null
}
