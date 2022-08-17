import { Player } from '@react-native-community/audio-toolkit'
import { Icon } from '@ui-kitten/components'
import React, { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { readFile } from 'react-native-fs'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { limitIntensities } from '@berty/utils/audio'
import { playSoundFile } from '@berty/utils/sound/sounds'

import { WaveForm } from '../../../WaveForm'
import { volumeValuesAttached, volumeValueLowest, volumeValuePrecision } from '../constant'
import { AudioPreviewWrapper } from './AudioPreviewWrapper'
import { AudioPreviewProps } from './interfaces'

export const AudioPreview: React.FC<AudioPreviewProps> = ({
	meteredValuesRef,
	recordDuration,
	recordFilePath,
	clearRecordingInterval,
	setRecordingState,
	setHelpMessageValue,
}) => {
	const { border, padding, margin } = useStyles()
	const colors = useThemeColor()
	const [player, setPlayer] = useState<Player>()
	const isPlaying = useMemo(() => player?.isPlaying === true, [player?.isPlaying])

	const onPress = () => {
		if (player?.isPlaying) {
			player?.pause()
		} else if (player?.isPaused) {
			player?.playPause()
		} else {
			readFile(recordFilePath, 'base64')
				.then(response => {
					console.log('SUCCESS')
					setPlayer(playSoundFile(response))
				})
				.catch(err => {
					console.error(err)
				})
		}
	}

	return (
		<AudioPreviewWrapper
			clearRecordingInterval={clearRecordingInterval}
			setRecordingState={setRecordingState}
			setHelpMessageValue={setHelpMessageValue}
		>
			<View
				style={[
					border.radius.medium,
					margin.right.small,
					padding.left.small,
					styles.content,
					{
						backgroundColor: colors['input-background'],
					},
				]}
			>
				<View style={styles.buttonWrapper}>
					<TouchableOpacity onPress={onPress}>
						<Icon
							name={isPlaying ? 'pause' : 'play'}
							fill={colors['background-header']}
							height={18}
							width={18}
							pack='custom'
						/>
					</TouchableOpacity>
					<WaveForm
						intensities={limitIntensities(
							meteredValuesRef.current.map(v =>
								Math.round((v - volumeValueLowest) * volumeValuePrecision),
							),
							volumeValuesAttached,
						)}
						currentTime={isPlaying && player?.currentTime ? player.currentTime : undefined}
						duration={recordDuration}
						color={colors['background-header']}
					/>
				</View>
			</View>
		</AudioPreviewWrapper>
	)
}

const styles = StyleSheet.create({
	content: {
		height: 50,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	buttonWrapper: {
		height: '100%',
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
