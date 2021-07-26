import React from 'react'
import { KeyboardAvoidingView, View, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

const OnboardingWrapper = ({ children }) => {
	const [{ absolute }] = useStyles()
	const colors = useThemeColor()

	return (
		<SafeAreaView style={[absolute.fill, { backgroundColor: colors['background-header'] }]}>
			<View style={absolute.fill}>
				<KeyboardAvoidingView
					style={[absolute.fill]}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					{children}
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}

export default OnboardingWrapper
