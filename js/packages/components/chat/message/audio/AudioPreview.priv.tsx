import React, { useMemo } from 'react'
import { View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { normalizeVolumeIntensities } from '@berty/utils/audio'

import { WaveForm } from '../../WaveForm'

export const AudioPreviewPriv: React.FC<{
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
