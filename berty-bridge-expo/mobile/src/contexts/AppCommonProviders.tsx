import { IconRegistry } from '@ui-kitten/components'
import { EvaIconsPack } from '@ui-kitten/eva-icons'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'

import { CustomIconsPack } from '@berty/assets/custom-icons'
import { FeatherIconsPack } from '@berty/assets/feather-icons'
import { useFonts } from '@berty/assets/fonts-loader'
import { AppDimensionsProvider, StyleProvider } from '@berty/contexts/styles'
import reduxStore from '@berty/redux/store'

const AppCommonProviders: React.FunctionComponent = ({ children }) => {
	const { isFontLoaded } = useFonts()

	if (!isFontLoaded) {
		return null
	}

	return (
		<SafeAreaProvider>
			<AppDimensionsProvider>
				<StyleProvider>
					<ReduxProvider store={reduxStore}>
						<IconRegistry icons={[EvaIconsPack, FeatherIconsPack, CustomIconsPack]} />
						{children}
					</ReduxProvider>
				</StyleProvider>
			</AppDimensionsProvider>
		</SafeAreaProvider>
	)
}

export default AppCommonProviders
