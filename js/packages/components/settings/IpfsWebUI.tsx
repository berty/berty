import React, { Component } from 'react'
import { View, ScrollView, StyleSheet, Text } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { HeaderSettings } from '../shared-components/Header'
import { WebView } from 'react-native-webview'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'

//
// IpfsWebUI
//

// Styles
const useStylesIpfsWebUI = () => {
	const [{ margin, height }] = useStyles()
	return {
		buttonRow: [margin.right.scale(20), height(90)],
		lastButtonRow: height(90),
		buttonRowMarginTop: margin.top.scale(20),
	}
}

const BodyIpfsWebUI: React.FC<{}> = () => {
	const _styles = useStylesIpfsWebUI()
	const [{ padding, flex, margin, color, text }] = useStyles()
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

export const IpfsWebUI: React.FC<ScreenProps.Settings.IpfsWebUI> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Ipfs WebUI' bgColor={color.dark.grey} undo={goBack} />
				<BodyIpfsWebUI />
			</ScrollView>
		</Layout>
	)
}
