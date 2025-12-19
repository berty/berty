
import React from 'react'
import { StatusBar, View } from 'react-native'

import { WebViews as SharedWebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

export const WebViews: ScreenFC<'Onboarding.WebViews'> = ({ route: { params } }) => {
	const { url } = params
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%' }}>
			<StatusBar barStyle='dark-content' />
			<SharedWebViews url={url} />
		</View>
	)
}
