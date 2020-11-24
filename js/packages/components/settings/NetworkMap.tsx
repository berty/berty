import React, { useEffect, useState } from 'react'
import {
	ScrollView,
	View,
	Text as TextNative,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { Translation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { protocolMethodsHooks } from '@berty-tech/store/methods'
import beapi from '@berty-tech/api'

import { HeaderSettings } from '../shared-components/Header'
import { usePrevious } from '../hooks'
import { pbDateToNum } from '../helpers'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

const PeerItem: React.FC<{ item: beapi.types.PeerList.IPeer; highlighted: boolean }> = ({
	item,
	highlighted,
}) => {
	const { id, minLatency, isActive, features } = item
	const [{ padding, border, color, text, row, height, width }] = useStyles()
	const [isDropdown, setIsDropdown] = useState(false)

	return (
		<View style={[border.scale(1), border.color.light.grey, border.radius.small]}>
			<View
				style={[
					{ justifyContent: 'space-evenly', flexDirection: 'row', alignItems: 'center' },
					highlighted && { backgroundColor: color.light.yellow },
					padding.small,
				]}
			>
				<View style={[row.center, { flex: 1 }]}>
					<View
						style={[
							width(12),
							height(12),
							border.radius.scale(6),
							{ backgroundColor: isActive ? color.green : color.red },
						]}
					/>
				</View>
				<View style={[row.center, { flex: 2 }]}>
					<Icon name='earth' pack='custom' fill={color.dark.grey} width={25} height={25} />
				</View>
				<View style={[row.center, { flex: 2 }]}>
					{features?.length
						? features.map((value) => {
								let name, pack, fill
								switch (value) {
									case beapi.types.PeerList.Feature.BertyFeature:
										name = 'berty'
										pack = 'custom'
										break
									case beapi.types.PeerList.Feature.QuicFeature:
										name = 'network'
										pack = 'custom'
										fill = color.dark.grey
										break
								}
								return (
									<Icon
										key={value}
										name={name}
										pack={pack}
										fill={fill || null}
										width={25}
										height={25}
									/>
								)
						  })
						: null}
				</View>
				<Text style={[text.align.center, { flex: 4 }]}>{id?.substr(0, 9)}</Text>
				<Text numberOfLines={1} style={[text.align.center, { flex: 3 }]}>
					{minLatency ? minLatency + 'ms' : '?'}
				</Text>
				<TouchableOpacity
					style={[row.center, { flex: 1 }]}
					onPress={() => setIsDropdown(!isDropdown)}
				>
					<Icon name='arrow-ios-downward' fill={color.dark.grey} width={25} height={25} />
				</TouchableOpacity>
			</View>
			{isDropdown && (
				<View style={[padding.small]}>
					<Text>{JSON.stringify(item, null, 2)}</Text>
				</View>
			)}
		</View>
	)
}

type PeersTypes = {
	berty: number
	quic: number
	ble: number
}

function getPeersTypes(peers: beapi.types.PeerList.IPeer[] | null) {
	let peersTypes = {
		berty: 0,
		quic: 0,
		ble: 0,
	}

	peers?.forEach((value) => {
		value?.features?.forEach((feature) => {
			switch (feature) {
				case beapi.types.PeerList.Feature.BertyFeature:
					peersTypes.berty += 1
					break
				case beapi.types.PeerList.Feature.QuicFeature:
					peersTypes.quic += 1
					break
			}
			console.log('heere', feature)
		})
	})

	return peersTypes
}

const NetworkMapBody: React.FC<{ peers: beapi.types.PeerList.IReply | null }> = ({ peers }) => {
	const [{ margin, text, color }] = useStyles()
	const [sortPeers, setSortPeers] = useState<beapi.types.PeerList.IPeer[] | null>(null)
	const [typesPeers, setTypesPeers] = useState<PeersTypes | null>(null)

	const prevPeers = usePrevious(sortPeers)

	useEffect(() => {
		if (peers?.peers) {
			setSortPeers(
				Object.values(peers.peers).sort(
					(a, b) => pbDateToNum(a.minLatency) - pbDateToNum(b.minLatency),
				),
			)
			setTypesPeers(getPeersTypes(peers.peers))
		}
	}, [peers])

	return (
		<Translation>
			{(t) => (
				<View style={[{ flexDirection: 'column' }]}>
					{sortPeers?.length ? (
						<View>
							<View style={[margin.medium]}>
								<TextNative
									style={[
										{ fontFamily: 'Open Sans' },
										text.bold.medium,
										text.size.large,
										text.color.dark.grey,
									]}
								>
									{`${t('settings.network-map.online-peers')} ${sortPeers.length}`}
								</TextNative>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'space-around',
										marginTop: 15,
									}}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Icon name='berty' pack='custom' width={25} height={25} />
										<TextNative
											style={[
												{ fontFamily: 'Open Sans' },
												text.bold.medium,
												text.size.large,
												text.color.dark.grey,
												margin.left.tiny,
											]}
										>
											{typesPeers?.berty}
										</TextNative>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Icon
											name='network'
											pack='custom'
											fill={color.dark.grey}
											width={25}
											height={25}
										/>
										<TextNative
											style={[
												{ fontFamily: 'Open Sans' },
												text.bold.medium,
												text.size.large,
												text.color.dark.grey,
												margin.left.tiny,
											]}
										>
											{typesPeers?.quic}
										</TextNative>
									</View>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Icon name='bluetooth' fill={color.dark.grey} width={25} height={25} />
										<TextNative
											style={[
												{ fontFamily: 'Open Sans' },
												text.bold.medium,
												text.size.large,
												text.color.dark.grey,
												margin.left.tiny,
											]}
										>
											{typesPeers?.ble}
										</TextNative>
									</View>
								</View>
							</View>
							<>
								{sortPeers.map((value) => {
									const elem = prevPeers?.find((v) => value.id?.toString() === v.id?.toString())
									return (
										<PeerItem item={value} highlighted={elem ? false : prevPeers ? true : false} />
									)
								})}
							</>
						</View>
					) : (
						<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
							<ActivityIndicator size='large' />
						</View>
					)}
				</View>
			)}
		</Translation>
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
		<Translation>
			{(t) => (
				<Layout style={[background.white, flex.tiny]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(30)}>
							<HeaderSettings
								title={t('settings.network-map.title')}
								bgColor={color.dark.grey}
								undo={goBack}
								action={() => call()}
								actionIcon='refresh-outline'
							/>
							<NetworkMapBody peers={peers} />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
