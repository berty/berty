import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

const CodeLicenseURL = 'https://raw.githubusercontent.com/berty/berty/master/LICENSE-APACHE'

export const CodeLicense: ScreenFC<'Settings.CodeLicense'> = () => {
	const colors = useThemeColor()
	const topInset = useTopInset()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%', paddingTop: topInset }}>
			<StatusBar style='dark' />
			<WebViews url={CodeLicenseURL} />
		</View>
	)
}
