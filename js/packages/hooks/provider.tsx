import React from 'react'
import { chat } from '@berty-tech/store'
import { Provider as ReactReduxProvider } from 'react-redux'
import { ActivityIndicator } from 'react-native'
import { PersistGate } from 'redux-persist/integration/react'
import { useStyles } from '@berty-tech/styles'
//import DevMenu from 'react-native-dev-menu'

/*export const Recorder: React.FC = ({ children }) => {
	React.useEffect(() => {
		DevMenu.addItem('(Chat) Start Test Recorder', () => {
			chat.recorder.start()
		})
		DevMenu.addItem('(Chat) Copy Test And Stop Recoder', () => {
			Clipboard.setString(
				chat.recorder
					.createTest()
					.replace(
						'/* import reducer from YOUR_REDUCER_LOCATION_HERE',
						"import * as chat from '..'\nconst { reducer } = chat.init()",
					),
			)
			chat.recorder.stop()
		})
	})

	return null
}*/

export const Provider: React.FC<{ config: chat.InitConfig }> = ({ config, children }) => {
	const store = chat.init(config)
	const [{ flex }] = useStyles()
	return (
		<ReactReduxProvider store={store}>
			<PersistGate
				loading={<ActivityIndicator size='large' style={[flex.medium]} />}
				persistor={store.persistor}
			>
				{children}
			</PersistGate>
		</ReactReduxProvider>
	)
}
