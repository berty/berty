import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { chat } from '@berty-tech/store'
import { useGetConversation } from './conversation'

// messages commands
export const useMessageSend = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.message.Command.Send) => dispatch(chat.message.commands.send(payload)),
		[dispatch],
	)
}

export const useMessageSendToAll = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.message.commands.sendToAll()), [dispatch])
}

export const useMessageHide = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.message.commands.hide()), [dispatch])
}

export const useMessageDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.message.Command.Delete) => dispatch(chat.message.commands.delete(payload)),
		[dispatch],
	)
}
// messages queries
export const useGetMessage = (id: string): chat.message.Entity | undefined => {
	const selector = useMemo(
		() => (state: chat.message.GlobalState) => chat.message.queries.get(state, { id }),
		[id],
	)
	const message = useSelector(selector)
	return message
}

export const useGetListMessage = (list: any): chat.message.Entity[] => {
	const selector = useMemo(
		() => (state: chat.message.GlobalState) => chat.message.queries.getList(state, { list }),
		[list],
	)
	const messages = useSelector(selector)
	return messages
}

export const useGetDateLastContactMessage = (id: string) => {
	const conversation = useGetConversation(id)
	const messages = useGetListMessage(conversation?.messages)
	if (!conversation) {
		return null
	}
	let lastDate
	conversation.kind !== 'fake' &&
		messages.length &&
		messages.map((message) => {
			if (!message?.isMe) {
				lastDate = message.receivedDate
			}
		})
	return lastDate || null
}
