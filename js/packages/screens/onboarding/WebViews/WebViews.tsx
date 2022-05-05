import { Layout } from '@ui-kitten/components'
import React from 'react'
import { StatusBar } from 'react-native'

import { WebViews as SharedWebViews } from '@berty/components/shared-components'
import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

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
