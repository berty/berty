import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { ScreenFC } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { WebViews } from '@berty/components/shared-components'

const FaqURL = 'https://guide.berty.tech/faq'

export const Faq: ScreenFC<'Settings.Faq'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='dark-content' />
			<WebViews url={FaqURL} />
		</Layout>
	)
}
