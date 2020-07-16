import React from 'react'
import { settings } from '@berty-tech/store'
import { Provider as ReactReduxProvider, useSelector, useDispatch } from 'react-redux'
import { ActivityIndicator } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import * as Messenger from './Messenger'

export const Provider: React.FC = ({ children }) => {
	const store = settings.init()
	return (
		<ReactReduxProvider store={store}>
			<PersistGate
				loading={<ActivityIndicator size='large' />}
				persistor={(store as any).persistor} // FIXME: store type to remove any cast
			>
				{children}
			</PersistGate>
		</ReactReduxProvider>
	)
}

export const useSettings = () => {
	return useSelector(settings.main.queries.get)
}

export const useSystemInfo = () => {
	const dispatch = useDispatch()
	const account = Messenger.useAccount()
	if (!account) {
		return () => {}
	}
	return () => {
		dispatch(settings.main.commands.systemInfo())
	}
}

type UseDebugGroup = (kwargs: { pk: string }) => () => void

export const useDebugGroup: UseDebugGroup = ({ pk }) => {
	const dispatch = useDispatch()
	const account = Messenger.useAccount()
	if (!account) {
		return () => {}
	}
	return () => {
		dispatch(settings.main.commands.debugGroup({ pk }))
	}
}

export const useToggleTracing = () => {
	const dispatch = useDispatch()
	return () => dispatch(settings.main.commands.toggleTracing())
}

export { settings as store }
