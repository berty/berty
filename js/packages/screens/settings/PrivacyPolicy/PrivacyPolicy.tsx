import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { WebViews } from '@berty/components/shared-components'

const PrivacyPolicyURL = 'https://berty.tech/privacy-policy#'

export const PrivacyPolicy: ScreenFC<'Settings.PrivacyPolicy'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={PrivacyPolicyURL} />
		</Layout>
	)
}
