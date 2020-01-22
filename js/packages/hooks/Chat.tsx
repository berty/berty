import React, { useMemo } from 'react'
import { chat } from '@berty-tech/store'
import { Provider as ReactReduxProvider, useDispatch, useSelector } from 'react-redux'
import DevMenu from 'react-native-dev-menu'
import { Clipboard } from 'react-native'

export const Recorder: React.FC = ({ children }) => {
	const [state, setState] = React.useState({})

	React.useEffect(() => {
		DevMenu.addItem('(Chat) Start/Reset Test Recorder', () => {
			chat.recorder.stop()
			chat.recorder.start()
		})
		DevMenu.addItem('(Chat) Copy Current Test', () => {
			Clipboard.setString(
				chat.recorder
					.createTest()
					.replace(
						'/* import reducer from YOUR_REDUCER_LOCATION_HERE */',
						"import * as chat from '..'\nconst { reducer } = chat.init()",
					),
			)
		})
	})

	return null
}

export const Provider: React.FC = ({ children }) => {
	return <ReactReduxProvider store={chat.init()}>{children}</ReactReduxProvider>
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

export const useAccountOpen = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: chat.account.Command.Open) => dispatch(chat.account.commands.open(payload)),
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
	return {}
}
