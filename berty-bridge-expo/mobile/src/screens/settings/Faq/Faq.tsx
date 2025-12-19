import React from 'react'
import { StatusBar, View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const FaqURL = 'https://guide.berty.tech/faq'

export const Faq: ScreenFC<'Settings.Faq'> = () => {
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%' }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={FaqURL} />
		</View>
	)
}
