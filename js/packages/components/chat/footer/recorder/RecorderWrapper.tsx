import { Recorder } from '@react-native-community/audio-toolkit'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Platform, Vibration, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useMessengerClient } from '@berty/hooks'
import { limitIntensities } from '@berty/utils/audio'

import { AudioPreview } from './audio-preview/AudioPreview'
import {
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
	voiceMemoBitrate,
	voiceMemoFormat,
	voiceMemoSampleRate,
} from './constant'
import { HelpMessage } from './HelpMessage'
import { RecorderButton } from './RecorderButton'
import { RecorderPreview } from './RecorderPreview'
import { attachMedias, audioMessageDisplayName, sendMessage } from './recorderWrapper.helper'

interface RecorderWrapperProps {
	convPk: string
	component: React.ReactNode
	distanceCancel?: number
	distanceLock?: number
	minAudioDuration?: number
	disableLockMode?: boolean
	disabled?: boolean
	sending?: boolean
	setSending: (val: boolean) => void
}

export const RecorderWrapper: React.FC<RecorderWrapperProps> = ({
	children,
	component,
	distanceCancel = 90,
	distanceLock = 40,
	disableLockMode = false,
	minAudioDuration = 2000,
	convPk,
	disabled,
	sending,
	setSending,
}) => {
	const dispatch = useAppDispatch()
	const recorder = React.useRef<Recorder | undefined>(undefined)
	const [recorderFilePath, setRecorderFilePath] = useState('')
	const { t } = useTranslation()

	const { padding } = useStyles()
	const [recordingState, setRecordingState] = useState(RecordingState.NOT_RECORDING)
	/*
	// use this to debug recording state
	const setRecordingState = React.useCallback(
		(state: RecordingState, msg?: string) => {
			console.log('setRecordingState', msg, RecordingState[state])
			_setRecordingState(state)
		},
		[_setRecordingState],
	)
	*/
	const [recordingStart, setRecordingStart] = useState(Date.now())
	const [clearRecordingInterval, setClearRecordingInterval] = useState<ReturnType<
		typeof setInterval
	> | null>(null)
	const [currentTime, setCurrentTime] = useState(Date.now())
	const [helpMessageTimeoutID, _setHelpMessageTimeoutID] = useState<ReturnType<
		typeof setTimeout
	> | null>(null)
	const [helpMessage, _setHelpMessage] = useState('')
	const recordingColorVal = React.useRef(new Animated.Value(0)).current
	const meteredValuesRef = useRef<number[]>([])
	const [recordDuration, setRecordDuration] = useState<number | null>(null)
	const client = useMessengerClient()

	const isRecording =
		recordingState === RecordingState.RECORDING ||
		recordingState === RecordingState.RECORDING_LOCKED

	const addMeteredValue = useCallback(
		metered => {
			meteredValuesRef.current.push(metered.value)
		},
		[meteredValuesRef],
	)

	const clearHelpMessageValue = useCallback(() => {
		if (helpMessageTimeoutID !== null) {
			clearTimeout(helpMessageTimeoutID)
			_setHelpMessageTimeoutID(null)
		}

		_setHelpMessage('')
	}, [helpMessageTimeoutID])

	const setHelpMessageValue = useCallback(
		({ message, delay = 3000 }: { message: string; delay?: number }) => {
			clearHelpMessageValue()
			_setHelpMessage(message)
			_setHelpMessageTimeoutID(setTimeout(() => clearHelpMessageValue(), delay))
		},
		[clearHelpMessageValue],
	)

	// effect to handle animation when the user is recording
	useEffect(() => {
		if (!isRecording) {
			return
		}

		const anim = Animated.loop(
			Animated.sequence([
				Animated.timing(recordingColorVal, {
					toValue: 1,
					duration: 250,
					useNativeDriver: Platform.OS !== 'web',
				}),
				Animated.timing(recordingColorVal, {
					toValue: 0,
					duration: 750,
					useNativeDriver: Platform.OS !== 'web',
				}),
			]),
		)

		anim.start()

		return () => anim.stop()
	}, [isRecording, recordingColorVal])

	const clearRecording = useCallback(() => {
		setRecordingState(RecordingState.NOT_RECORDING)
		if (clearRecordingInterval === null) {
			return
		}
		clearInterval(clearRecordingInterval)
		setRecordDuration(null)
		;(recorder.current as any)?.removeListener('meter', addMeteredValue)
	}, [addMeteredValue, clearRecordingInterval])

	const sendComplete = useCallback(
		async ({ duration, start }: { duration: number; start: number }) => {
			try {
				if (sending) {
					return
				}
				setSending(true)
				Vibration.vibrate(400)
				if (!client) {
					return
				}
				const startDate = new Date(start)
				const displayName = audioMessageDisplayName(startDate)
				const medias = await attachMedias(client, [
					{
						displayName,
						filename: displayName + '.aac',
						mimeType: 'audio/aac',
						uri: recorderFilePath,
						metadataBytes: beapi.messenger.MediaMetadata.encode({
							items: [
								{
									metadataType: beapi.messenger.MediaMetadataType.MetadataAudioPreview,
									payload: beapi.messenger.AudioPreview.encode({
										bitrate: voiceMemoBitrate,
										format: voiceMemoFormat,
										samplingRate: voiceMemoSampleRate,
										volumeIntensities: limitIntensities(
											meteredValuesRef.current.map(v =>
												Math.round((v - volumeValueLowest) * volumeValuePrecision),
											),
											volumeValuesAttached,
										),
										durationMs: duration,
									}).finish(),
								},
							],
						}).finish(),
					},
				])

				await sendMessage(client!, convPk, dispatch, { medias })
			} catch (e) {
				console.warn(e)
			}
			setSending(false)
		},
		[convPk, client, recorderFilePath, dispatch, sending, setSending],
	)

	const handleRecordingComplete = useCallback(async () => {
		await recorder.current?.stop(async err => {
			const duration = recordDuration || Date.now() - recordingStart

			if (err !== null) {
				if (duration) {
					if (duration >= minAudioDuration) {
						await sendComplete({ duration, start: recordingStart })
					}
				} else {
					console.warn(err)
				}
			} else if (duration < minAudioDuration) {
				setHelpMessageValue({
					message: t('audio.record.tooltip.usage'),
				})
			} else {
				await sendComplete({ duration, start: recordingStart })
			}

			clearRecording()
		})
	}, [
		clearRecording,
		minAudioDuration,
		recordDuration,
		recordingStart,
		sendComplete,
		setHelpMessageValue,
		t,
	])

	// effect that handle recording state machine
	useEffect(() => {
		switch (recordingState) {
			case RecordingState.PENDING_CANCEL:
				Vibration.vibrate(200)
				setRecordingState(RecordingState.CANCELLING)
				break

			case RecordingState.CANCELLING:
				recorder.current?.stop(() => {
					recorder.current?.destroy()
				})
				clearRecording()
				break

			case RecordingState.PENDING_PREVIEW:
				recorder.current?.stop(() => {
					setRecordDuration(Date.now() - recordingStart)
				})
				setRecordingState(RecordingState.PREVIEW)
				break

			case RecordingState.COMPLETE:
				handleRecordingComplete()
				break
		}
	}, [clearRecording, handleRecordingComplete, recordingStart, recordingState])

	return Platform.OS === 'web' ? (
		<View style={[padding.left.scale(10), { flex: 1 }]}>{children}</View>
	) : (
		<View style={{ flexDirection: 'row' }}>
			{helpMessage !== '' && (
				<HelpMessage helpMessage={helpMessage} clearHelpMessageValue={clearHelpMessageValue} />
			)}
			{isRecording && (
				<RecorderPreview
					recordingState={recordingState}
					recordingColorVal={recordingColorVal}
					setRecordingState={setRecordingState}
					setHelpMessageValue={setHelpMessageValue}
					timer={currentTime - recordingStart}
				/>
			)}
			{recordingState === RecordingState.PREVIEW && (
				<AudioPreview
					meteredValuesRef={meteredValuesRef}
					recordDuration={recordDuration}
					recordFilePath={recorderFilePath}
					clearRecordingInterval={clearRecordingInterval}
					setRecordingState={setRecordingState}
					setHelpMessageValue={setHelpMessageValue}
				/>
			)}
			{(recordingState === RecordingState.NOT_RECORDING ||
				recordingState === RecordingState.PENDING_CANCEL) && (
				<View style={[padding.left.scale(10), { flex: 1 }]}>{children}</View>
			)}
			{(recordingState === RecordingState.NOT_RECORDING ||
				recordingState === RecordingState.RECORDING ||
				recordingState === RecordingState.PENDING_CANCEL) && (
				<RecorderButton
					component={component}
					disabled={disabled}
					addMeteredValue={addMeteredValue}
					setRecordingState={setRecordingState}
					clearHelpMessageValue={clearHelpMessageValue}
					setHelpMessageValue={setHelpMessageValue}
					meteredValuesRef={meteredValuesRef}
					recorder={recorder}
					recordingState={recordingState}
					disableLockMode={disableLockMode}
					distanceCancel={distanceCancel}
					distanceLock={distanceLock}
					setRecorderFilePath={setRecorderFilePath}
					setRecordingStart={setRecordingStart}
					setClearRecordingInterval={setClearRecordingInterval}
					setCurrentTime={setCurrentTime}
				/>
			)}
		</View>
	)
}
