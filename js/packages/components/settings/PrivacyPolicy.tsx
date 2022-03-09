import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { WebViews } from '../shared-components'

export const PrivacyPolicy: ScreenFC<'Settings.PrivacyPolicy'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url='https://berty.tech/privacy-policy#' />
		</Layout>
	)
}
