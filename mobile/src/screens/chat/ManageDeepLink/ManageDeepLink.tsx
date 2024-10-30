import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

import { ManageDeepLinkContent } from './ManageDeepLinkContent'

export const ManageDeepLink: ScreenFC<'Chat.ManageDeepLink'> = ({ route: { params } }) => {
	const colors = useThemeColor()
	const { border } = useStyles()

	const { type, value: link } = params

	return (
		<>
			{/*TODO on Android when we can render a BlurView on the first render, re-enable it*/}
			{Platform.OS === 'ios' && <BlurView style={[StyleSheet.absoluteFill]} blurType='light' />}
			<SafeAreaView
				accessibilityLabel='ManageDeepLink'
				style={[border.shadow.huge, { shadowColor: colors.shadow }]}
			>
				<ManageDeepLinkContent type={type} link={link} />
			</SafeAreaView>
		</>
	)
}
