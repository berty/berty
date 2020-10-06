import React from 'react'
import { KeyboardAvoidingView, View } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

const OnboardingWrapper = ({ children }) => {
	const [{ absolute, background }] = useStyles()
	return (
		<SafeAreaView style={[absolute.fill, background.blue]}>
			<View style={absolute.fill}>
				<KeyboardAvoidingView style={[absolute.fill]} behavior='padding'>
					{children}
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	)
}

export default OnboardingWrapper
