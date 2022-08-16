import { Recorder } from '@react-native-community/audio-toolkit'
import { useNavigation } from '@react-navigation/native'
import { Icon } from '@ui-kitten/components'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import {
	LongPressGestureHandler,
	LongPressGestureHandlerGestureEvent,
	LongPressGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler'
import { RESULTS } from 'react-native-permissions'

import { useThemeColor } from '@berty/hooks'
import { checkPermission } from '@berty/utils/permissions/checkPermissions'
import { getPermissions, PermissionType } from '@berty/utils/permissions/permissions'

import { RecordingState, voiceMemoBitrate, voiceMemoFormat, voiceMemoSampleRate } from './constant'

interface RecorderButtonProps {
	setCurrentTime: (time: number) => void
	disabled?: boolean
	recordingState: RecordingState
	distanceCancel: number
	setHelpMessageValue: ({ message }: { message: string }) => void
	setRecordingState: (val: RecordingState) => void
	disableLockMode: boolean
	distanceLock: number
	clearHelpMessageValue: () => void
	setRecordingStart: (val: number) => void
	// eslint-disable-next-line no-undef
	setClearRecordingInterval: (val: NodeJS.Timer | null) => void
	meteredValuesRef: React.MutableRefObject<number[]>
	recorder: React.MutableRefObject<Recorder | undefined>
	setRecorderFilePath: (val: string) => void
	addMeteredValue: (val: number) => void
	component: React.ReactNode
}

export const RecorderButton: React.FC<RecorderButtonProps> = ({
	setCurrentTime,
	disabled,
	recordingState,
	distanceCancel,
	setHelpMessageValue,
	setRecordingState,
	disableLockMode,
	distanceLock,
	clearHelpMessageValue,
	setRecordingStart,
	setClearRecordingInterval,
	meteredValuesRef,
	recorder,
	setRecorderFilePath,
	addMeteredValue,
	component,
}) => {
	const { navigate } = useNavigation()
	const { t } = useTranslation()
	const colors = useThemeColor()

	const updateRecordingPressEvent = useCallback(
		(e: LongPressGestureHandlerGestureEvent) => {
			if (disabled) {
				return
			}

			if (
				recordingState !== RecordingState.RECORDING &&
				recordingState !== RecordingState.RECORDING_LOCKED
			) {
				return
			}

			if (e.nativeEvent.x < -distanceCancel) {
				console.log('cancel recording')
				setHelpMessageValue({ message: t('audio.record.tooltip.not-sent') })
				console.log('slide cancel')
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}

			if (!disableLockMode && e.nativeEvent.y < -distanceLock) {
				console.log('locking recording')
				setRecordingState(RecordingState.RECORDING_LOCKED)
				return
			}
		},
		[
			disableLockMode,
			disabled,
			distanceCancel,
			distanceLock,
			recordingState,
			setHelpMessageValue,
			setRecordingState,
			t,
		],
	)

	const createRecorder = useCallback(() => {
		recorder.current = new Recorder('tempVoiceClip.aac', {
			channels: 1,
			bitrate: voiceMemoBitrate,
			sampleRate: voiceMemoSampleRate,
			format: voiceMemoFormat,
			encoder: voiceMemoFormat,
			quality: 'low',
			meteringInterval: 20,
		}).prepare((err, filePath) => {
			if (err) {
				console.log('recorder prepare error', err?.message)
			}
			setRecorderFilePath(filePath)
		})
		recorder.current.record(err => {
			if (err) {
				console.log('recorder record error', err?.message)
			} else {
				try {
					;(recorder.current as any)?.on('meter', addMeteredValue)
				} catch (e) {
					console.warn(['err' + e])
				}
			}
		})
	}, [addMeteredValue, recorder, setRecorderFilePath])

	const handlePressRecording = useCallback(async () => {
		const initialStatus = (await getPermissions()).audio

		await checkPermission({
			permissionType: PermissionType.audio,
			navigate,
			accept: () => {
				// We check the initialStatus before ask it, to don't record after asking permission
				// (In other apps, the recorder don't start after accept permission)
				if (initialStatus === RESULTS.GRANTED) {
					clearHelpMessageValue()
					setRecordingStart(Date.now())
					setCurrentTime(Date.now())
					setClearRecordingInterval(setInterval(() => setCurrentTime(Date.now()), 100))
					meteredValuesRef.current = []

					createRecorder()

					setRecordingState(RecordingState.RECORDING)
				}
			},
			deny: () => {
				setHelpMessageValue({ message: t('audio.record.tooltip.permission-denied') }) //'App is not allowed to record sound'
			},
		})
	}, [
		clearHelpMessageValue,
		createRecorder,
		meteredValuesRef,
		navigate,
		setClearRecordingInterval,
		setCurrentTime,
		setHelpMessageValue,
		setRecordingStart,
		setRecordingState,
		t,
	])

	const recordingPressStatus = useCallback(
		async (e: LongPressGestureHandlerStateChangeEvent) => {
			if (disabled) {
				return
			}

			// Pressed
			if (e.nativeEvent.state === State.ACTIVE) {
				console.log('start')
				if (recordingState === RecordingState.NOT_RECORDING) {
					await handlePressRecording()
				}
				return
			}

			// Released
			if (recordingState !== RecordingState.NOT_RECORDING && e.nativeEvent.state === State.END) {
				console.log('end')
				setRecordingState(RecordingState.COMPLETE)
				return
			}

			// Cancelled
			if (
				recordingState !== RecordingState.NOT_RECORDING &&
				(e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED)
			) {
				console.log('state cancel', e.nativeEvent.state)
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}
		},
		[disabled, handlePressRecording, recordingState, setRecordingState],
	)

	return (
		<LongPressGestureHandler
			minDurationMs={0}
			maxDist={42000}
			onGestureEvent={updateRecordingPressEvent}
			onHandlerStateChange={recordingPressStatus}
			shouldCancelWhenOutside={false}
		>
			<View style={styles.container}>
				{recordingState === RecordingState.RECORDING && (
					<View
						style={[
							styles.recordWrapper,
							{
								borderColor: `${colors['reverted-main-text']}c0`,
								backgroundColor: colors['background-header'],
								top: -distanceLock - 30,
							},
						]}
					>
						<View style={{ paddingBottom: 2 }}>
							<Icon
								name='lock'
								pack='feather'
								height={18}
								width={18}
								fill={colors['reverted-main-text']}
							/>
						</View>
					</View>
				)}
				<View>{component}</View>
			</View>
		</LongPressGestureHandler>
	)
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'flex-end',
		paddingRight: 15,
	},
	recordWrapper: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 18,
		borderWidth: 1,
		width: 36,
		height: 36,
		position: 'absolute',
		right: 16,
		paddingVertical: 5,
	},
})
