import React from 'react'

import { Layout } from '@ui-kitten/components'
import { View, ScrollView } from 'react-native'
import { WebView } from 'react-native-webview'

import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

//
// IpfsWebUI
//

const BodyIpfsWebUI: React.FC<{}> = () => {
	const [{ padding, flex, margin }] = useStyles()
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
