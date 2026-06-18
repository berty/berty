import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

const PrivacyPolicyURL = 'https://berty.tech/privacy-policy#'

export const PrivacyPolicy: ScreenFC<'Settings.PrivacyPolicy'> = () => {
	const colors = useThemeColor()
	const topInset = useTopInset()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%', paddingTop: topInset }}>
			<StatusBar style='dark' />
			<WebViews url={PrivacyPolicyURL} />
		</View>
	)
}
