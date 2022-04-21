import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, View } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { readFile } from 'react-native-fs'

import { playSoundFile, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

import {
	limitIntensities,
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
	WaveForm,
} from '../../audioMessageCommon'
import { SendButton } from '../ChatFooterButtons'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

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
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [player, setPlayer] = useState<any>(null)
	const isPlaying = useMemo(() => player?.isPlaying === true, [player?.isPlaying])

	return (
		<View
			style={[{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }, margin.horizontal.medium]}
		>
			<TouchableOpacity
				style={[
					padding.horizontal.small,
					margin.right.small,
					{
						alignItems: 'center',
						justifyContent: 'center',
						width: 36 * scaleSize,
						height: 36 * scaleSize,
						backgroundColor: colors['secondary-background-header'],
						borderRadius: 18,
					},
				]}
				onPress={() => {
					clearInterval(clearRecordingInterval as any)
					setHelpMessageValue({
						message: t('audio.record.tooltip.not-sent'),
					})
					setRecordingState(RecordingState.PENDING_CANCEL)
				}}
			>
				<Icon
					name='trash-outline'
					height={20 * scaleSize}
					width={20 * scaleSize}
					fill={colors['reverted-main-text']}
				/>
			</TouchableOpacity>
			<View
				style={[
					border.radius.medium,
					margin.right.small,
					padding.left.small,
					{
						height: 50,
						flex: 1,
						backgroundColor: colors['input-background'],
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					},
				]}
			>
				<View
					style={[
						{
							height: '100%',
							flex: 1,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
						},
					]}
				>
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
							height={18 * scaleSize}
							width={18 * scaleSize}
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
						currentTime={isPlaying && player?.currentTime}
						duration={recordDuration}
						color={colors['background-header']}
					/>
				</View>
			</View>
			<SendButton
				onPress={() => {
					setRecordingState(RecordingState.COMPLETE)
				}}
			/>
		</View>
	)
}
