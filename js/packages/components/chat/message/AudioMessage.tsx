import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useMsgrContext } from '@berty-tech/store/hooks'

import { useStyles } from '@berty-tech/styles'
import { Player } from '@react-native-community/audio-toolkit'
import WaveForm from 'react-native-audiowaveform'
import { getSource } from '../../utils'
import moment from 'moment'
import { useMusicPlayer } from '@berty-tech/music-player'

export const AudioMessage: React.FC<{ medias: any }> = ({ medias }) => {
	const { protocolClient } = useMsgrContext()
	const [{ padding, color, border, margin }, { windowWidth }] = useStyles()
	const [source, setSource] = useState('')
	const mimeType = medias[0].mimeType
	const { player: globalPlayer, setPlayer: setGlobalPlayer, handlePlayPause } = useMusicPlayer()
	const [player, setPlayer] = useState<Player>()
	useEffect(() => {
		if (!protocolClient) {
			return
		}
		let cancel = false
		getSource(protocolClient, medias[0].cid)
			.then((src) => {
				if (!cancel) {
					let base64 = `data:${mimeType};base64,${src}`
					setSource(base64)
					setPlayer(new Player(base64).prepare())
				}
			})
			.catch((e) => console.error('failed to get attachment image:', e))
		return () => {
			cancel = true
		}
	}, [protocolClient, mimeType, medias])

	let currentTime =
		globalPlayer.id === medias[0].cid ? globalPlayer.player?.currentTime : player?.currentTime

	return (
		<View
			style={[
				{
					flex: 1,
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[
					{
						backgroundColor: '#E9EAF8',
						alignItems: 'center',
						justifyContent: 'center',
						height: 80,
						width: windowWidth - 100,
						maxWidth: 400,
					},
					border.radius.large,
				]}
			>
				{!!source && (
					<WaveForm
						style={{
							height: 60,
							width: windowWidth - 100,
							maxWidth: 400,
							position: 'absolute',
							// top: 10,
							left: 0,
							// borderWidth: 1,
							// borderColor: color.red,
						}}
						source={{ uri: source }}
						waveFormStyle={{
							waveColor: '#4F58C0',
							scrubColor: 'transparent',
						}}
						autoPlay={false}
					/>
				)}

				<TouchableOpacity
					onPress={() => {
						if (globalPlayer.id === medias[0].cid) {
							handlePlayPause()
						} else {
							setGlobalPlayer(source, medias[0].cid)
						}
					}}
					style={[
						padding.vertical.tiny,
						padding.horizontal.big,
						border.radius.small,
						{
							backgroundColor: '#4F58C0',
							alignSelf: 'center',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name={
							globalPlayer.id === medias[0].cid && globalPlayer.player?.isPlaying ? 'pause' : 'play'
						}
						fill='white'
						height={30}
						width={30}
						pack='custom'
					/>
				</TouchableOpacity>
			</View>
			<View
				style={[
					border.radius.small,
					padding.horizontal.small,
					padding.vertical.tiny,

					{
						backgroundColor: '#4F58C0',
						flexDirection: 'row',
						alignContent: 'center',
						alignItems: 'center',
						shadowColor: '#000',
						shadowOffset: {
							width: 0,
							height: 2,
						},
						shadowOpacity: 0.25,
						shadowRadius: 3.84,

						elevation: 5,
					},
				]}
			>
				<Text style={{ color: color.white }}>
					{moment.utc(Number((currentTime || 0) > 0 ? currentTime : 0)).format('mm:ss')}
				</Text>
				<View
					style={[
						margin.horizontal.small,
						{
							height: 12,
							width: 1.5,
							backgroundColor: color.white,
							opacity: 0.5,
						},
					]}
				/>
				<Text
					style={{
						color: color.white,
					}}
				>
					{moment.utc(Number(player?.duration) > 0 ? player?.duration : 0).format('mm:ss')}
				</Text>
			</View>
		</View>
	)
}
