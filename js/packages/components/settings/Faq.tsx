import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { WebView } from 'react-native-webview'

import { useThemeColor } from '@berty-tech/store/hooks'

export const Faq = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<WebView source={{ uri: 'https://webviews.berty.tech/faq/' }} />
		</Layout>
	)
}
