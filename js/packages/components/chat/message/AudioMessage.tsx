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
}> = React.memo(({ media, currentTime = 0 }) => {
	const colors = useThemeColor()
	const [{ padding, margin }] = useStyles()

	const [normalizedIntensities, duration] = useMemo(() => {
		if (!media.metadataBytes) {
			return [null, null]
		}

		const metadata = beapi.messenger.MediaMetadata.decode(media.metadataBytes)
		const previews = metadata?.items.filter(
			m => m.metadataType === beapi.messenger.MediaMetadataType.MetadataAudioPreview,
		)

		if (previews === undefined || previews.length === 0) {
			console.log('no preview: ', metadata)
			return [null, null]
		}

		const preview = beapi.messenger.AudioPreview.decode(previews[0].payload!)

		console.log('preview', preview)
		return [normalizeVolumeIntensities(preview.volumeIntensities), preview.durationMs]
	}, [media.metadataBytes])

	if (normalizedIntensities === null) {
		return (
			<View style={[{ flex: 1 }, padding.horizontal.small, margin.right.small]}>
				<Text style={{ color: colors['main-background'] }} numberOfLines={1} ellipsizeMode='tail'>
					{media.displayName || media.filename || 'audio'}
				</Text>
			</View>
		)
	}

	return (
		<WaveForm intensities={normalizedIntensities} duration={duration} currentTime={currentTime} />
	)
})

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
	const mediaCID = useMemo(() => medias[0].cid, [medias])
	const mimeType = (medias.length > 0 && medias[0].mimeType) || 'blob'

	const isPlaying = useMemo(
		() => globalPlayer.metadata?.id === mediaCID && globalPlayer.player?.isPlaying === true,
		[globalPlayer.metadata?.id, globalPlayer.player?.isPlaying, mediaCID],
	)

	useEffect(() => {
		if (!isPlaying) {
			return
		}

		return () => {
			if (!mimeType.startsWith('audio') || globalPlayer.player?.isStopped === false) {
				return
			}

			globalPlayerLoad(
				(async (): Promise<[string, PlayerItemMetadata]> => {
					const next = await client?.mediaGetRelated({
						cid: mediaCID,
						fileNames: [voiceMemoFilename],
					})

					if (!next || next.end) {
						throw new EndError()
					}

					const srcP = getSource(protocolClient!, next.media?.cid!)
					await playSoundAsync('contactRequestAccepted')
					const src = await srcP

					return [
						`data:${mimeType};base64,${src}`,
						{
							id: next.media?.cid!,
						},
					]
				})(),
			)
		}
	}, [mediaCID, isPlaying, globalPlayer.player, globalPlayerLoad, client, protocolClient, mimeType])

	return (
		<View style={{ position: 'relative', zIndex: 2 }}>
			<View
				style={{
					position: 'absolute',
					bottom: -2 * scaleSize,
					[isMine ? 'right' : 'left']: 10 * scaleSize,
					transform: [{ rotate: isMine ? '-45deg' : '45deg' }, { scaleX: isMine ? 1 : -1 }],
				}}
			>
				<View
					style={[
						{
							position: 'absolute',
							backgroundColor: colors['background-header'],
							width: 25 * scaleSize,
							height: 30 * scaleSize,
							bottom: 1 * scaleSize,
							borderBottomLeftRadius: 25 * scaleSize,
							right: -12 * scaleSize,
							zIndex: -1,
						},
					]}
				/>
				<View
					style={[
						{
							position: 'absolute',
							backgroundColor: colors['main-background'],
							width: 20 * scaleSize,
							height: 35 * scaleSize,
							bottom: -6 * scaleSize,
							borderBottomLeftRadius: 50 * scaleSize,
							right: -16 * scaleSize,
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
							} else if (protocolClient && mediaCID) {
								globalPlayerLoad(
									getSource(protocolClient, mediaCID).then(src => [
										`data:${mimeType};base64,${src}`,
										{
											id: mediaCID,
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
