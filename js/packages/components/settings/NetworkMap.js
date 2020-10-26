import React, { useEffect, useState, useRef } from 'react'
import { ScrollView, View, Text as TextNative, ActivityIndicator } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { HeaderSettings } from '../shared-components/Header'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { protocolMethodsHooks } from '@berty-tech/store/methods'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

const PeerItem = ({ id, latency, highlighted }) => {
	const [{ padding, border, color, text, row }] = useStyles()
	return (
		<View
			style={[
				padding.small,
				border.scale(1),
				border.color.light.grey,
				border.radius.small,
				{ justifyContent: 'space-evenly', flexDirection: 'row', alignItems: 'center' },
				highlighted && { backgroundColor: color.light.yellow },
			]}
		>
			<View style={[row.center, { flex: 2 }]}>
				<Icon name='earth' pack='custom' fill={color.dark.grey} width={25} height={25} />
			</View>
			<View style={[row.center, { flex: 2 }]}>
				<Icon name='network' pack='custom' fill={color.dark.grey} width={25} height={25} />
			</View>
			<Text style={[text.align.center, { flex: 4 }]}>{id.substr(0, 9)}</Text>
			<Text numberOfLines={1} style={[text.align.center, { flex: 3 }]}>
				{latency ? latency + 'ms' : '?'}
			</Text>
			<View style={[row.center, { flex: 1 }]}>
				<Icon name='arrow-ios-downward' fill={color.dark.grey} width={25} height={25} />
			</View>
		</View>
	)
}

function usePrevious(value) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

const NetworkMapBody = ({ peers }) => {
	const [{ margin, text }] = useStyles()
	const [sortPeers, setSortPeers] = useState(null)

	const prevPeers = usePrevious(sortPeers)

	useEffect(() => {
		if (peers?.peers) {
			setSortPeers(
				Object.values(peers.peers).sort((a, b) => {
					if (!a.latency) {
						return 1
					}
					if (!b.latency) {
						return -1
					}
					return a.latency > b.latency
				}),
			)
		}
	}, [peers])

	return (
		<View style={[{ flexDirection: 'column' }]}>
			{sortPeers?.length ? (
				<View>
					<TextNative
						style={[
							{ fontFamily: 'Open Sans' },
							text.bold.medium,
							text.size.large,
							text.color.dark.grey,
							margin.left.medium,
							margin.vertical.medium,
						]}
					>
						{`Online Peers ${sortPeers.length}`}
					</TextNative>
					<>
						{sortPeers.map((value) => {
							const elem = prevPeers?.find((v) => value.id.toString() === v.id.toString())
							return <PeerItem {...value} highlighted={elem ? false : prevPeers ? true : false} />
						})}
					</>
				</View>
			) : (
				<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
					<ActivityIndicator size='large' />
				</View>
			)}
		</View>
	)
}

export const NetworkMap = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	const { reply: peers = {}, call, called } = protocolMethodsHooks.usePeerList()

	useEffect(() => {
		if (!called) {
			call()
		}
	}, [called, call])

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings
						title='Network List'
						bgColor={color.dark.grey}
						undo={goBack}
						action={() => call()}
						actionIcon='refresh-outline'
					/>
					<NetworkMapBody peers={peers} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
