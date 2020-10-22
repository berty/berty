import React, { useEffect } from 'react'
import { ScrollView, View, Text as TextNative } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { HeaderSettings } from '../shared-components/Header'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { protocolMethodsHooks } from '@berty-tech/store/methods'

const PeerItem = ({ id }) => {
	const [{ padding, height, background }] = useStyles()
	return (
		<View style={[padding.small]}>
			<Text>{id}</Text>
			<View style={[height(1), padding.horizontal.large, background.grey]} />
		</View>
	)
}

const NetworkMapBody = () => {
	const { reply: peers = {}, call, called } = protocolMethodsHooks.usePeerList()
	const [{ padding, text }] = useStyles()

	useEffect(() => {
		if (!called) {
			call()
		}
	}, [called, call])

	return (
		<View style={[padding.medium, { flexDirection: 'column' }]}>
			<TextNative style={[{ fontFamily: 'Open Sans' }, text.bold.small, text.size.large]}>
				Online Peers
			</TextNative>
			{peers?.peers &&
				Object.keys(peers.peers).length &&
				Object.values(peers.peers).map((value, key) => {
					console.log('InMap', key, value.streams)
					return <PeerItem {...value} />
				})}
		</View>
	)
}

export const NetworkMap = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Network Map' bgColor={color.dark.grey} undo={goBack} />
				<NetworkMapBody />
			</ScrollView>
		</Layout>
	)
}
