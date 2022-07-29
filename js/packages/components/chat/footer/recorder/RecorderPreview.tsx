import { Icon } from '@ui-kitten/components'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { SendButton } from '../ChatFooterButtons'
import { RecordingState } from './constant'

interface RecordingPreviewProps {
	recordingState: RecordingState
	recordingColorVal: Animated.Value
	setRecordingState: React.Dispatch<React.SetStateAction<RecordingState>>
	setHelpMessageValue: ({ message, delay }: { message: string; delay?: number | undefined }) => void
	timer: number
}

export const RecorderPreview: React.FC<RecordingPreviewProps> = ({
	recordingState,
	recordingColorVal,
	setRecordingState,
	setHelpMessageValue,
	timer,
}) => {
	const { border, padding, margin, text } = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()

	return (
		<View style={styles.container}>
			<View style={[margin.left.medium, styles.wrapper]}>
				<View
					style={[
						{
							backgroundColor: colors['secondary-background-header'],
						},
						styles.textWrapper,
						padding.horizontal.small,
						border.radius.small,
					]}
				>
					<UnifiedText style={{ color: colors['reverted-main-text'] }}>
						{moment.utc(timer).format('mm:ss')}
					</UnifiedText>
				</View>
				<Animated.View
					style={[
						{
							backgroundColor: colors['main-background'],
							opacity: recordingColorVal.interpolate({
								inputRange: [0, 1],
								outputRange: [0, 0.2],
							}),
						},
						styles.animatedWrapper,
						border.radius.small,
						margin.right.small,
					]}
				/>
				<TouchableOpacity
					onPress={() => {
						if (recordingState === RecordingState.RECORDING_LOCKED) {
							setHelpMessageValue({
								message: t('audio.record.tooltip.not-sent'),
							})
							setRecordingState(RecordingState.PENDING_CANCEL)
						}
					}}
					style={[border.radius.small, styles.recordingLockedCancelButton]}
				>
					{recordingState !== RecordingState.RECORDING_LOCKED ? (
						<UnifiedText style={[text.bold, { padding: 5 }]}>
							{t('audio.record.slide-to-cancel')}
						</UnifiedText>
					) : (
						<UnifiedText style={[text.bold, { padding: 5 }]}>
							{t('audio.record.cancel-button')}
						</UnifiedText>
					)}
				</TouchableOpacity>
				{recordingState === RecordingState.RECORDING_LOCKED && (
					<TouchableOpacity
						style={styles.recordingLockedIconButton}
						onPress={() => setRecordingState(RecordingState.PENDING_PREVIEW)}
					>
						<Icon name='square' height={20} width={20} fill={colors['reverted-main-text']} />
					</TouchableOpacity>
				)}
			</View>
			{recordingState === RecordingState.RECORDING_LOCKED && (
				<View style={styles.recordingLockedSendButton}>
					<SendButton onPress={() => setRecordingState(RecordingState.COMPLETE)} />
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	wrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		height: 40,
		flex: 1,
	},
	recordingLockedSendButton: {
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		paddingRight: 15,
	},
	recordingLockedIconButton: {
		marginRight: 10,
		paddingHorizontal: 12,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 100,
		position: 'absolute',
		bottom: 0,
		top: 0,
		right: 0,
	},
	recordingLockedCancelButton: {
		alignItems: 'center',
		justifyContent: 'center',
		bottom: 0,
		top: 0,
		position: 'absolute',
	},
	animatedWrapper: {
		position: 'absolute',
		right: 0,
		left: 0,
		top: 0,
		bottom: 0,
	},
	textWrapper: {
		position: 'absolute',
		right: 0,
		left: 0,
		top: 0,
		bottom: 0,
		justifyContent: 'center',
		marginRight: 8,
	},
})
