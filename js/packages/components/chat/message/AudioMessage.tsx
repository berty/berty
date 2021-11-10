import React, { useEffect, useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import moment from 'moment'

import { useMessengerContext, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { EndError, PlayerItemMetadata, useMusicPlayer } from '@berty-tech/music-player'
import beapi from '@berty-tech/api'
import { playSoundAsync } from '@berty-tech/store/sounds'

import { limitIntensities, voiceMemoFilename } from '../record/common'
import { getSource } from '../../utils'

const volumeValueShown = 50

const normalizeVolumeIntensities = (intensities: Array<number>) => {
	const min = Math.min(...intensities)
	const max = Math.max(...intensities)

	intensities = limitIntensities(
		intensities.map(i => (i - min) / (max - min)),
		volumeValueShown,
	)

	return intensities
}

export const WaveForm: React.FC<{
	intensities: any[]
	duration: number | null
	currentTime?: number
}> = ({ intensities, duration, currentTime = 0 }) => {
	const normalizedIntensities = useMemo(
		() => normalizeVolumeIntensities(intensities),
		[intensities],
	)
	const [{ margin, text }] = useStyles()
	const colors = useThemeColor()
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				flex: 1,
				padding: 8,
				height: '100%',
			}}
		>
			<View style={{ flex: 1, flexDirection: 'row', height: '100%', alignItems: 'center' }}>
				{normalizedIntensities.map((intensity, index) => {
					return (
						<React.Fragment key={index}>
							<View
								style={{
									backgroundColor:
										duration &&
										index < Math.floor((currentTime! / duration) * normalizedIntensities.length)
											? colors['main-background']
											: colors['background-header'],
									minHeight: 5,
									height: 70 * intensity + '%',
									flex: 2,
									borderRadius: 5,
								}}
							/>
							<View style={{ flex: 1 }} />
						</React.Fragment>
					)
				})}
			</View>
			<Text style={[{ color: colors['background-header'] }, margin.left.tiny, text.size.small]}>
				{moment.utc(duration).format('mm:ss')}
			</Text>
		</View>
	)
}

const AudioPreview: React.FC<{
	media: beapi.messenger.IMedia
	currentTime?: number
}> = ({ media, currentTime = 0 }) => {
	const colors = useThemeColor()
	const [normalizedIntensities, duration] = useMemo(() => {
		const metadata = beapi.messenger.MediaMetadata.decode(media.metadataBytes!)
		const previews = metadata?.items.filter(
			m => m.metadataType === beapi.messenger.MediaMetadataType.MetadataAudioPreview,
		)

		if (previews === undefined || previews.length === 0) {
			return [null, null]
		}

		const preview = beapi.messenger.AudioPreview.decode(previews[0].payload!)
		return [normalizeVolumeIntensities(preview.volumeIntensities), preview.durationMs]
	}, [media.metadataBytes])

	if (normalizedIntensities === null) {
		return (
			<View style={{ flex: 1 }}>
				<Text style={{ color: colors['background-header'] }} numberOfLines={1}>
					{media.filename!}
				</Text>
			</View>
		)
	}

	return (
		<WaveForm intensities={normalizedIntensities} duration={duration} currentTime={currentTime} />
	)
}

export const AudioMessage: React.FC<{
	medias: Array<beapi.messenger.IMedia>
	onLongPress: () => void
	isHighlight: boolean
}> = ({ medias, onLongPress, isHighlight }) => {
	const colors = useThemeColor()
	const { protocolClient, client } = useMessengerContext()
	const [{ padding, border, margin }, { windowWidth, scaleSize }] = useStyles()
	const { player: globalPlayer, load: globalPlayerLoad, handlePlayPause } = useMusicPlayer()
	const cid = useMemo(() => medias[0].cid, [medias])
	const filename = useMemo(() => medias[0].filename, [medias])

	const isPlaying = useMemo(
		() => globalPlayer.metadata?.id === cid && globalPlayer.player?.isPlaying === true,
		[globalPlayer.metadata?.id, globalPlayer.player?.isPlaying, cid],
	)

	useEffect(() => {
		if (!isPlaying) {
			return
		}

		return () => {
			if (filename !== voiceMemoFilename || globalPlayer.player?.isStopped === false) {
				return
			}

			globalPlayerLoad(
				(async (): Promise<[string, PlayerItemMetadata]> => {
					const next = await client?.mediaGetRelated({
						cid: cid,
						fileNames: [voiceMemoFilename],
					})

					if (!next || next.end) {
						throw new EndError()
					}

					const srcP = getSource(protocolClient!, next.media?.cid!)
					await playSoundAsync('contactRequestAccepted')
					const src = await srcP

					return [
						`data:${next.media?.mimeType};base64,${src}`,
						{
							id: next.media?.cid!,
						},
					]
				})(),
			)
		}
	}, [cid, isPlaying, globalPlayer.player, globalPlayerLoad, client, protocolClient, filename])

	return (
		<TouchableOpacity
			style={{ alignItems: 'center' }}
			onLongPress={onLongPress}
			activeOpacity={0.9}
		>
			<View
				style={[
					{
						backgroundColor: colors['input-background'],
						alignItems: 'center',
						justifyContent: 'center',
						height: 50,
						width: windowWidth - 100,
						maxWidth: 400,
						flexDirection: 'row',
					},
					border.radius.small,
					isHighlight && {
						borderColor: colors['background-header'],
						borderWidth: 1,
						shadowColor: colors.shadow,
						shadowOffset: {
							width: 0,
							height: 8,
						},
						shadowOpacity: 0.44,
						shadowRadius: 10.32,
						elevation: 16,
					},
				]}
			>
				<TouchableOpacity
					onPress={() => {
						if (!cid) {
							return
						}
						if (globalPlayer.metadata?.id === medias[0].cid) {
							handlePlayPause()
						} else if (protocolClient) {
							globalPlayerLoad(
								getSource(protocolClient, cid).then(src => [
									`data:${medias[0].mimeType};base64,${src}`,
									{
										id: cid,
									},
								]),
							)
						}
					}}
					style={[
						padding.top.tiny,
						padding.left.scale(10),
						border.radius.small,
						margin.tiny,
						{
							alignSelf: 'center',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
					<Icon
						name={isPlaying ? 'pause' : 'play'}
						fill={colors['background-header']}
						height={26 * scaleSize}
						width={26 * scaleSize}
						pack='custom'
					/>
				</TouchableOpacity>
				<AudioPreview
					media={medias[0]}
					currentTime={isPlaying ? globalPlayer.player?.currentTime : 0}
				/>
			</View>
		</TouchableOpacity>
	)
}
