import { Player } from '@react-native-community/audio-toolkit'
import { Icon } from '@ui-kitten/components'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { readFile } from 'react-native-fs'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { playSoundFile } from '@berty/utils/sound/sounds'

import {
	limitIntensities,
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
	WaveForm,
} from '../../audioMessageCommon'
import { SendButton } from '../ChatFooterButtons'

export const PreviewComponent: React.FC<{
	meteredValuesRef: React.MutableRefObject<number[]>
	recordDuration: number | null
	recordFilePath: string
	clearRecordingInterval: ReturnType<typeof setInterval> | null
	setRecordingState: React.Dispatch<React.SetStateAction<RecordingState>>
	setHelpMessageValue: ({ message, delay }: { message: string; delay?: number | undefined }) => void
}> = ({
	meteredValuesRef,
	recordDuration,
	recordFilePath,
	clearRecordingInterval,
	setRecordingState,
	setHelpMessageValue,
}) => {
	const { border, padding, margin } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [player, setPlayer] = useState<Player>()
	const isPlaying = useMemo(() => player?.isPlaying === true, [player?.isPlaying])

	return (
		<View style={[styles.container, margin.horizontal.medium]}>
			<TouchableOpacity
				style={[
					padding.horizontal.small,
					margin.right.small,
					styles.deleteButton,
					{
						backgroundColor: colors['secondary-background-header'],
					},
				]}
				onPress={() => {
					if (clearRecordingInterval) {
						clearInterval(clearRecordingInterval)
					}
					setHelpMessageValue({
						message: t('audio.record.tooltip.not-sent'),
					})
					setRecordingState(RecordingState.PENDING_CANCEL)
				}}
			>
				<Icon name='trash-outline' height={20} width={20} fill={colors['reverted-main-text']} />
			</TouchableOpacity>
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
					<TouchableOpacity
						onPress={() => {
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
						}}
					>
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
			<SendButton onPress={() => setRecordingState(RecordingState.COMPLETE)} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	deleteButton: {
		alignItems: 'center',
		justifyContent: 'center',
		width: 36,
		height: 36,
		borderRadius: 18,
	},
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
