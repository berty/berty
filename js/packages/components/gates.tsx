import React from 'react'
import { View, Image, StatusBar } from 'react-native'
import { useSelector } from 'react-redux'

import source from '@berty/assets/images/loader_dots.gif'
import { selectMessengerIsNotReady } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'

export const LoaderDots: React.FC = () => {
	const colors = useThemeColor()

	return (
		<View
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				width: '100%',
				backgroundColor: colors['main-background'],
			}}
		>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			<Image
				source={source}
				style={{ width: '80%', height: '40%', maxWidth: 170, maxHeight: 80 }}
			/>
		</View>
	)
}

export const LoaderGate: React.FC = ({ children }) => {
	const colors = useThemeColor()
	const isNotReady = useSelector(selectMessengerIsNotReady)

	if (isNotReady) {
		return <LoaderDots />
	}
	return (
		<>
			<StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
			{children}
		</>
	)
}
