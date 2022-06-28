import { Layout } from '@ui-kitten/components'
import React from 'react'
import { View, ScrollView } from 'react-native'
import { WebView } from 'react-native-webview'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

//
// IpfsWebUI
//

const BodyIpfsWebUI: React.FC<{}> = () => {
	const { padding, flex, margin } = useStyles()
	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<WebView
				source={{ uri: 'http://127.0.0.1:3000' }}
				//TODO: remove fixed height
				style={[{ height: 1000 }]}
			/>
		</View>
	)
}

export const IpfsWebUI: ScreenFC<'Settings.IpfsWebUI'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
				<BodyIpfsWebUI />
			</ScrollView>
		</Layout>
	)
}
