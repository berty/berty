import React, { useEffect, useMemo } from 'react'
import { View, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'

import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { EndError, PlayerItemMetadata, useMusicPlayer } from '@berty-tech/music-player'
import beapi from '@berty-tech/api'
import { playSoundAsync } from '@berty-tech/store/sounds'
import { useMessengerContext } from '@berty-tech/store'

import { normalizeVolumeIntensities, voiceMemoFilename, WaveForm } from '../audioMessageCommon'
import { getSource } from '../../utils'

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
				<Text style={{ color: colors['main-background'] }} numberOfLines={1}>
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
	isMine: boolean
}> = ({ medias, onLongPress, isHighlight, isMine }) => {
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
		<View style={{ position: 'relative', zIndex: 2 }}>
			<View
				style={{
					position: 'absolute',
					bottom: -8,
					[isMine ? 'right' : 'left']: 10,
					transform: [{ rotate: isMine ? '-45deg' : '45deg' }, { scaleX: isMine ? 1 : -1 }],
				}}
			>
				<View
					style={[
						{
							position: 'absolute',
							backgroundColor: colors['background-header'],
							width: 25,
							height: 30,
							bottom: 0,
							borderBottomLeftRadius: 25,
							right: -12,
							zIndex: -1,
						},
					]}
				/>
				<View
					style={[
						{
							position: 'absolute',
							backgroundColor: colors['main-background'],
							width: 20,
							height: 35,
							bottom: -6,
							borderBottomLeftRadius: 50,
							right: -16,
							zIndex: -1,
						},
					]}
				/>
			</View>
			<TouchableWithoutFeedback style={{ alignItems: 'center' }} onLongPress={onLongPress}>
				<View
					style={[
						{
							backgroundColor: colors['background-header'],
							alignItems: 'center',
							justifyContent: 'center',
							height: 50,
							width: windowWidth - 100,
							maxWidth: 400,
							flexDirection: 'row',
						},
						border.radius.big,
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
						onPress={async () => {
							if (
								globalPlayer.metadata?.id === medias[0].cid &&
								globalPlayer.player?.currentTime !== -1
							) {
								handlePlayPause()
							} else if (protocolClient && cid) {
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
							padding.left.scale(10),
							border.radius.small,
							margin.left.small,
							margin.right.tiny,
							{
								alignSelf: 'center',
								alignItems: 'center',
								justifyContent: 'center',
							},
						]}
					>
						<View
							style={[
								padding.scale(7),
								border.radius.scale(12),
								{
									backgroundColor: `${colors['main-background']}80`,
								},
							]}
						>
							<Icon
								name={isPlaying ? 'pause' : 'play'}
								fill={colors['main-background']}
								height={16 * scaleSize}
								width={16 * scaleSize}
								pack='custom'
							/>
						</View>
					</TouchableOpacity>
					<AudioPreview
						media={medias[0]}
						currentTime={isPlaying ? globalPlayer.player?.currentTime : 0}
					/>
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}
