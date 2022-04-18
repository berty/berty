import React, { useMemo } from 'react'
import { View, TouchableWithoutFeedback, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store/hooks'
import { useStyles } from '@berty/contexts/styles'
import { useMusicPlayer } from '@berty/components/providers/musicPlayer.provider'
import beapi from '@berty/api'

import { normalizeVolumeIntensities, WaveForm } from '../audioMessageCommon'
import { useSelector } from 'react-redux'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const AudioPreview: React.FC<{
	media: beapi.messenger.IMedia
	currentTime?: number
}> = React.memo(({ media, currentTime = 0 }) => {
	const colors = useThemeColor()
	const { padding, margin } = useStyles()

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
				<UnifiedText
					style={{ color: colors['reverted-main-text'] }}
					numberOfLines={1}
					ellipsizeMode='tail'
				>
					{media.displayName || media.filename || 'audio'}
				</UnifiedText>
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
	const protocolClient = useSelector(selectProtocolClient)
	const { padding, border, margin } = useStyles()
	const { windowWidth, scaleSize } = useAppDimensions()
	const {
		player: globalPlayer,
		load: globalPlayerLoad,
		handlePlayPause,
		loading: globalPlayerLoading,
		playing: globalPlayerPlaying,
		currentTime,
	} = useMusicPlayer()
	const mediaCID = useMemo(() => medias[0].cid, [medias])
	const mimeType = (medias.length > 0 && medias[0].mimeType) || 'blob'

	const isCurrent = globalPlayer.metadata?.id === mediaCID
	const isPlaying = isCurrent && globalPlayerPlaying
	const loading = isCurrent && globalPlayerLoading === true

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
						onPress={() => {
							if (
								globalPlayer.metadata?.id === medias[0].cid &&
								globalPlayer.player?.currentTime !== -1
							) {
								handlePlayPause()
							} else if (protocolClient && mediaCID) {
								globalPlayerLoad(mediaCID, mimeType)
							}
						}}
						disabled={loading}
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
								isCurrent ? border.radius.scale(10) : border.radius.scale(12),
								{
									backgroundColor: `${colors['main-background']}80`,
									borderWidth: 1,
									borderColor: '#0000',
								},

								isCurrent && {
									borderColor: `${colors['reverted-main-text']}50`,
								},
							]}
						>
							{loading ? (
								<ActivityIndicator color={colors['reverted-main-text']} size={16 * scaleSize} />
							) : (
								<Icon
									name={isPlaying ? 'pause' : 'play'}
									fill={colors['reverted-main-text']}
									height={16 * scaleSize}
									width={16 * scaleSize}
									pack='custom'
								/>
							)}
						</View>
					</TouchableOpacity>
					<AudioPreview media={medias[0]} currentTime={isCurrent ? currentTime : 0} />
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}
