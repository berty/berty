import React from 'react'
import { StatusBar, View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const PrivacyPolicyURL = 'https://berty.tech/privacy-policy#'

export const PrivacyPolicy: ScreenFC<'Settings.PrivacyPolicy'> = () => {
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%' }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={PrivacyPolicyURL} />
		</View>
	)
}
