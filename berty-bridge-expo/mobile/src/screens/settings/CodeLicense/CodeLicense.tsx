import React from 'react'
import { StatusBar, View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const CodeLicenseURL = 'https://raw.githubusercontent.com/berty/berty/master/LICENSE-APACHE'

export const CodeLicense: ScreenFC<'Settings.CodeLicense'> = () => {
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%' }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={CodeLicenseURL} />
		</View>
	)
}
