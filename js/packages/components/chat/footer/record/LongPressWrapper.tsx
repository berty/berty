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

import { useThemeColor } from '@berty/hooks'

import { RecordingState } from '../../audioMessageCommon'
import {
	acquireMicPerm,
	MicPermStatus,
	voiceMemoBitrate,
	voiceMemoFormat,
	voiceMemoSampleRate,
} from './record.helper'

interface LongPressWrapperProps {
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

export const LongPressWrapper: React.FC<LongPressWrapperProps> = ({
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

	const updateCurrentTime = useCallback(() => {
		setCurrentTime(Date.now())
	}, [setCurrentTime])

	const updateRecordingPressEvent = useCallback(
		(e: LongPressGestureHandlerGestureEvent) => {
			//console.log('gesture event', e)

			if (disabled) {
				return
			}

			//setXY({ x: e.nativeEvent.x, y: e.nativeEvent.y })

			if (
				recordingState !== RecordingState.RECORDING &&
				recordingState !== RecordingState.RECORDING_LOCKED
			) {
				return
			}

			if (e.nativeEvent.x < -distanceCancel /* && e.nativeEvent.y > -20 && e.nativeEvent.y < 70*/) {
				console.log('cancel recording')
				setHelpMessageValue({
					message: t('audio.record.tooltip.not-sent'),
				})
				console.log('slide cancel')
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}

			if (
				!disableLockMode &&
				e.nativeEvent.y < -distanceLock /* &&
				e.nativeEvent.x > -20 &&
				e.nativeEvent.x < 50*/
			) {
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

	const recordingPressStatus = useCallback(
		async (e: LongPressGestureHandlerStateChangeEvent) => {
			if (disabled) {
				return
			}

			// Pressed
			if (e.nativeEvent.state === State.ACTIVE) {
				console.log('start')
				if (recordingState === RecordingState.NOT_RECORDING) {
					const permState = await acquireMicPerm(navigate)
					if (permState !== MicPermStatus.GRANTED) {
						setHelpMessageValue({ message: t('audio.record.tooltip.permission-denied') }) //'App is not allowed to record sound'
						return
					}

					clearHelpMessageValue()
					setRecordingStart(Date.now())
					setCurrentTime(Date.now())
					setClearRecordingInterval(setInterval(() => updateCurrentTime(), 100))
					meteredValuesRef.current = []

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
					setRecordingState(RecordingState.RECORDING)
				}

				return
			}

			// Released
			if (recordingState !== RecordingState.NOT_RECORDING && e.nativeEvent.state === State.END) {
				console.log('end')
				setRecordingState(RecordingState.COMPLETE)

				return
			}

			if (
				recordingState !== RecordingState.NOT_RECORDING &&
				(e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED)
			) {
				console.log('state cancel', e.nativeEvent.state)
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}
		},
		[
			addMeteredValue,
			clearHelpMessageValue,
			disabled,
			meteredValuesRef,
			navigate,
			recorder,
			recordingState,
			setClearRecordingInterval,
			setCurrentTime,
			setHelpMessageValue,
			setRecorderFilePath,
			setRecordingStart,
			setRecordingState,
			t,
			updateCurrentTime,
		],
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
