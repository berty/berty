import { Layout } from '@ui-kitten/components'
import React from 'react'
import { StatusBar } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const CodeLicenseURL = 'https://raw.githubusercontent.com/berty/berty/master/LICENSE-APACHE'

export const CodeLicense: ScreenFC<'Settings.CodeLicense'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={CodeLicenseURL} />
		</Layout>
	)
}
