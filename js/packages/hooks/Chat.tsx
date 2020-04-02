import React, { useMemo } from 'react'
import { chat, protocol } from '@berty-tech/store'
import { Provider as ReactReduxProvider, useDispatch, useSelector } from 'react-redux'
import DevMenu from 'react-native-dev-menu'
import { ActivityIndicator, Clipboard } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { Buffer } from 'buffer'
import { berty } from '@berty-tech/api'

export const Recorder: React.FC = ({ children }) => {
	React.useEffect(() => {
		DevMenu.addItem('(Chat) Start Test Recorder', () => {
			chat.recorder.start()
		})
		DevMenu.addItem('(Chat) Copy Test And Stop Recoder', () => {
			Clipboard.setString(
				chat.recorder
					.createTest()
					.replace(
						'/* import reducer from YOUR_REDUCER_LOCATION_HERE */',
						"import * as chat from '..'\nconst { reducer } = chat.init()",
					),
			)
			chat.recorder.stop()
		})
	})

	return null
}

export const Provider: React.FC<{ config: chat.InitConfig }> = ({ config, children }) => {
	const store = chat.init(config)
	return (
		<ReactReduxProvider store={store}>
			<PersistGate loading={<ActivityIndicator size='large' />} persistor={store.persistor}>
				{children}
			</PersistGate>
		</ReactReduxProvider>
	)
}

// messages commands
export const useMessageSend = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.message.Command.Send) => dispatch(chat.message.commands.send(payload)),
		[dispatch],
	)
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

// account queries
export const useAccountList = () => {
	const list = useSelector((state: chat.account.GlobalState) =>
		chat.account.queries.list(state, {}),
	)
	return list
}

export const useAccountLength = () => {
	return useAccountList().length
}

export const useAccount = () => {
	// TODO: replace by selected account
	const accounts = useAccountList()
	const len = useAccountLength()
	return len > 0 ? accounts[0] : null
}

export const useClient = () => {
	const account = useAccount()
	return useSelector(
		(state: protocol.client.GlobalState) =>
			account && protocol.client.queries.get(state, { id: account.id }),
	)
}

// account commands
export const useAccountGenerate = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(chat.account.commands.generate()), [dispatch])
}

export const useAccountCreate = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.account.Command.Create) => dispatch(chat.account.commands.create(payload)),
		[dispatch],
	)
}

export const useAccountSendContactRequest = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	if (!account) {
		return () => {}
	}
	return (val: string) => {
		const parts = val.split(' ')
		if (parts.length !== 2) {
			throw new Error('Corrupted content')
		}
		const [name, ref] = parts
		dispatch(
			chat.account.commands.sendContactRequest({
				id: account.id,
				otherName: Buffer.from(name, 'base64').toString('utf-8'),
				otherReference: ref,
			}),
		)
	}
}

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

export const useAccountDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.account.Command.Delete) => dispatch(chat.account.commands.delete(payload)),
		[dispatch],
	)
}

// requests queries
export const useContactRequestReference = () => {
	const account = useAccount()
	const ref = useSelector((state: protocol.client.GlobalState) =>
		account != null ? chat.account.queries.getRequestReference(state, { id: account.id }) : null,
	)
	if (!account) {
		return
	}
	return `${Buffer.from(account.name, 'utf-8').toString('base64')} ${ref}`
}

export const useContactRequestEnabled = () => {
	const ref = useContactRequestReference()
	return !!ref
}

export const useAccountContacts = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account ? chat.contact.queries.list(state) : [],
	)
}

export const useAccountContactsWithIncomingRequests = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account
			? chat.contact.queries
					.list(state)
					.filter((contact) => contact.request.type === chat.contact.ContactRequestType.Incoming)
			: [],
	)
}

export const useAccountContactsWithOutgoingRequests = () => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account
			? chat.contact.queries
					.list(state)
					.filter((contact) => contact.request.type === chat.contact.ContactRequestType.Outgoing)
			: [],
	)
}

export const useAcceptContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.contact.commands.acceptRequest({
				id,
			}),
		)
}

export const useDiscardContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.contact.commands.discardRequest({
				id,
			}),
		)
}

export const useAccountContactSearchResults = (searchText: string): chat.contact.Entity[] => {
	const account = useAccount()
	return useSelector((state: chat.contact.GlobalState) =>
		account ? chat.contact.queries.search(state, { accountId: account.id, searchText }) : [],
	)
}

// conversation queries
export const useConversationList = () => {
	const list = useSelector((state: chat.conversation.GlobalState) =>
		chat.conversation.queries.list(state),
	)
	return list
}

export const useConversationLength = () => {
	return useConversationList().length
}

export const useGetConversation = (id: string): chat.conversation.Entity => {
	const conversation = useSelector((state: chat.conversation.GlobalState) =>
		chat.conversation.queries.get(state, { id }),
	)
	return conversation
}

export const useOneToOneConversationContact = (id: string): chat.contact.Entity | undefined => {
	const conversation = useGetConversation(id)
	return useSelector(
		(state: chat.contact.GlobalState) =>
			(conversation?.kind === berty.chatmodel.Conversation.Kind.OneToOne &&
				chat.contact.queries.get(state, { id: conversation.contactId })) ||
			undefined,
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
