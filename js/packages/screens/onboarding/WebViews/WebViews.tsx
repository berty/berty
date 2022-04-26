import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store'
import { ScreenFC } from '@berty/navigation'

import { WebViews as SharedWebViews } from '@berty/components/shared-components'

export const WebViews: ScreenFC<'Onboarding.WebViews'> = ({ route: { params } }) => {
	const { url } = params
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='dark-content' />
			<SharedWebViews url={url} />
		</Layout>
	)
}
