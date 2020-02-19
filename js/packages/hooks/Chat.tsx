import React, { useMemo } from 'react'
import { chat, protocol } from '@berty-tech/store'
import { Provider as ReactReduxProvider, useDispatch, useSelector } from 'react-redux'
import DevMenu from 'react-native-dev-menu'
import { ActivityIndicator, Clipboard } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { Buffer } from 'buffer'

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

export const useAccountReplay = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.account.Command.Replay) => dispatch(chat.account.commands.replay(payload)),
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

export const useAccountSendContactRequest = () => {
	const dispatch = useDispatch()
	const account = useAccount()
	if (!account) {
		return () => {}
	}
	return (val: string) => {
		const parts = val.split(' ')
		if (parts.length !== 2) {
			throw new Error('Corrupted deep link')
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

export const useIncomingContactRequests = () => {
	return useSelector((state: chat.incomingContactRequest.GlobalState) =>
		chat.incomingContactRequest.queries.list(state, {}),
	)
}

export const useOutgoingContactRequests = () => {
	return useSelector((state: chat.outgoingContactRequest.GlobalState) =>
		chat.outgoingContactRequest.queries.list(state, {}),
	)
}

export const useAccountIncomingContactRequests = () => {
	const account = useAccount()
	const incomingContactRequests = useIncomingContactRequests()
	if (!account) {
		return []
	}
	return incomingContactRequests.filter((req) => req.accountId === account.id)
}

export const useAccountOutgoingContactRequests = () => {
	const account = useAccount()
	const incomingContactRequests = useOutgoingContactRequests()
	if (!account) {
		return []
	}
	return incomingContactRequests.filter((req) => req.accountId === account.id)
}

export const useAccountAcceptContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.incomingContactRequest.commands.accept({
				id,
			}),
		)
}

export const useAccountDiscardContactRequest = () => {
	const dispatch = useDispatch()
	return ({ id }: { id: string }) =>
		dispatch(
			chat.incomingContactRequest.commands.discard({
				id,
			}),
		)
}

export const useContactSearchResults = (searchText: string): chat.contact.Entity[] => {
	return useSelector((state: chat.contact.GlobalState) =>
		chat.contact.queries.search(state, { searchText }),
	)
}
