import React from 'react'

import { Layout } from '@ui-kitten/components'
import { StatusBar } from 'react-native'

import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { WebViews as SharedWebViews } from '../shared-components'

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
