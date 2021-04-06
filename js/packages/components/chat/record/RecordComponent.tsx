import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Platform, Text, TouchableOpacity, Vibration, View } from 'react-native'
import {
	LongPressGestureHandler,
	LongPressGestureHandlerGestureEvent,
	LongPressGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { Recorder } from '@react-native-community/audio-toolkit'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'

import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { playSound } from '@berty-tech/store/sounds'
import { useMsgrContext } from '@berty-tech/store/hooks'

import {
	limitIntensities,
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
	voiceMemoFilename,
} from './common'
import { RecordingComponent } from './RecordingComponent'
import { PreviewComponent } from './PreviewComponent'

enum MicPermStatus {
	UNDEFINED = 0,
	GRANTED = 1,
	NEWLY_GRANTED = 2,
	DENIED = 3,
}

const voiceMemoBitrate = 32000
const voiceMemoSampleRate = 22050
const voiceMemoFormat = 'aac'

const acquireMicPerm = async (): Promise<MicPermStatus> => {
	try {
		const status = await check(
			Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
		)
		if (status === RESULTS.GRANTED) {
			return MicPermStatus.GRANTED
		}

		try {
			const status = await request(
				Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
			)

			if (status === RESULTS.GRANTED) {
				return MicPermStatus.NEWLY_GRANTED
			}

			return MicPermStatus.DENIED
		} catch (err) {
			console.log(err)
		}
	} catch (err) {
		console.log(err)
	}

	return MicPermStatus.UNDEFINED
}

const sendMessage = async (
	client: WelshMessengerServiceClient,
	convPk: string,
	opts: {
		body?: string
		medias?: string[]
	},
) => {
	client
		?.interact({
			conversationPublicKey: convPk,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
			payload: beapi.messenger.AppMessage.UserMessage.encode({ body: opts.body || '' }).finish(),
			mediaCids: opts.medias,
		})
		.then(() => {
			playSound('messageSent')
		})
		.catch((e) => {
			console.warn('e sending message:', e)
		})
}

interface Attachment extends beapi.messenger.IMedia {
	uri?: string
}

const attachMedias = async (client: WelshMessengerServiceClient, res: Attachment[]) =>
	(
		await Promise.all(
			res.map(async (doc) => {
				const stream = await client?.mediaPrepare({})
				await stream?.emit({
					info: {
						filename: doc.filename,
						mimeType: doc.mimeType,
						displayName: doc.filename,
						metadataBytes: doc.metadataBytes,
					},
					uri: doc.uri,
				})
				const reply = await stream?.stopAndRecv()
				return reply?.cid
			}),
		)
	).filter((cid) => !!cid)

export const RecordComponent: React.FC<{
	convPk: string
	component: React.ReactNode
	aFixMicro: Animated.AnimatedInterpolation
	distanceCancel?: number
	distanceLock?: number
	minAudioDuration?: number
	disableLockMode?: boolean
}> = ({
	children,
	component,
	aFixMicro,
	distanceCancel = 200,
	distanceLock = 80,
	disableLockMode = false,
	minAudioDuration = 1000,
	convPk,
}) => {
	const ctx = useMsgrContext()
	const recorder = React.useRef<Recorder | undefined>(undefined)
	const [recorderFilePath, setRecorderFilePath] = useState('')
	const { t } = useTranslation()

	const [{ border, padding, margin, color }, { scaleSize }] = useStyles()
	const [recordingState, setRecordingState] = useState(RecordingState.NOT_RECORDING)
	const [recordingStart, setRecordingStart] = useState(Date.now())
	const [clearRecordingInterval, setClearRecordingInterval] = useState<ReturnType<
		typeof setInterval
	> | null>(null)
	const [xy, setXY] = useState({ x: 0, y: 0 })
	const [currentTime, setCurrentTime] = useState(Date.now())
	const [helpMessageTimeoutID, _setHelpMessageTimeoutID] = useState<ReturnType<
		typeof setTimeout
	> | null>(null)
	const [helpMessage, _setHelpMessage] = useState('')
	const recordingColorVal = React.useRef(new Animated.Value(0)).current
	const meteredValuesRef = useRef<number[]>([])
	const [recordDuration, setRecordDuration] = useState<number | null>(null)

	const isRecording =
		recordingState === RecordingState.RECORDING ||
		recordingState === RecordingState.RECORDING_LOCKED

	const addMeteredValue = useCallback(
		(metered: any) => {
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

	useEffect(() => {
		if (!isRecording) {
			return
		}

		const anim = Animated.loop(
			Animated.sequence([
				Animated.timing(recordingColorVal, {
					toValue: 1,
					duration: 250,
					useNativeDriver: true,
				}),
				Animated.timing(recordingColorVal, {
					toValue: 0,
					duration: 750,
					useNativeDriver: true,
				}),
			]),
		)

		anim.start()

		return () => anim.stop()
	}, [isRecording, recordingColorVal])

	const clearRecording = useCallback(() => {
		if (clearRecordingInterval === null) {
			return
		}

		clearInterval(clearRecordingInterval)
		setRecordingState(RecordingState.NOT_RECORDING)
		setRecordDuration(null)
		;(recorder.current as any)?.removeListener('meter', addMeteredValue)
	}, [addMeteredValue, clearRecordingInterval])

	const sendComplete = useCallback(
		({ duration }: { duration: number }) => {
			Vibration.vibrate(400)
			attachMedias(ctx.client!, [
				{
					filename: voiceMemoFilename,
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
										meteredValuesRef.current.map((v) =>
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
				.then((cids) => {
					return sendMessage(ctx.client!, convPk, { medias: cids })
				})
				.catch((e) => console.warn(e))
		},
		[convPk, ctx.client, recorderFilePath],
	)

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
				recorder.current?.stop((err) => {
					const duration = recordDuration || Date.now() - recordingStart

					if (err !== null) {
						if (recordDuration) {
							sendComplete({ duration })
						} else {
							console.warn(err)
						}
					} else if (duration < minAudioDuration) {
						setHelpMessageValue({
							message: t('audio.record.tooltip.usage'),
						})
					} else {
						sendComplete({ duration })
					}

					clearRecording()
				})
				break
		}
	}, [
		recordingStart,
		recordingState,
		clearRecording,
		minAudioDuration,
		setHelpMessageValue,
		ctx.client,
		recorderFilePath,
		convPk,
		t,
		meteredValuesRef,
		recordDuration,
		sendComplete,
	])

	const updateCurrentTime = useCallback(() => {
		setCurrentTime(Date.now())
	}, [setCurrentTime])

	const updateRecordingPressEvent = useCallback(
		(e: LongPressGestureHandlerGestureEvent) => {
			setXY({ x: e.nativeEvent.x, y: e.nativeEvent.y })

			if (
				recordingState !== RecordingState.RECORDING &&
				recordingState !== RecordingState.RECORDING_LOCKED
			) {
				return
			}

			if (e.nativeEvent.x < -distanceCancel && e.nativeEvent.y > -20 && e.nativeEvent.y < 70) {
				setHelpMessageValue({
					message: t('audio.record.tooltip.not-sent'),
				})
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}

			if (!disableLockMode && e.nativeEvent.y < -distanceLock && xy.x > -20 && xy.x < 50) {
				setRecordingState(RecordingState.RECORDING_LOCKED)
				return
			}
		},
		[disableLockMode, distanceCancel, distanceLock, recordingState, setHelpMessageValue, t, xy.x],
	)

	const recordingPressStatus = useCallback(
		async (e: LongPressGestureHandlerStateChangeEvent) => {
			// Pressed
			if (e.nativeEvent.state === State.BEGAN || e.nativeEvent.state === State.ACTIVE) {
				if (recordingState === RecordingState.NOT_RECORDING) {
					const permState = await acquireMicPerm()
					if (permState === MicPermStatus.NEWLY_GRANTED) {
						setHelpMessageValue({
							message: t('audio.record.tooltip.usage'),
						})

						return
					} else if (permState === MicPermStatus.DENIED || permState === MicPermStatus.UNDEFINED) {
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
					recorder.current.record((err) => {
						if (err) {
							console.log('recorder record error', err?.message)
						} else {
							try {
								;(recorder.current as any)?.on('meter', addMeteredValue)
							} catch (e) {
								console.warn(['err' + e])
							}
							setRecordingState(RecordingState.RECORDING)
						}
					})
				}

				return
			}

			// Released
			if (e.nativeEvent.state === State.END) {
				if (recordingState === RecordingState.RECORDING) {
					setRecordingState(RecordingState.COMPLETE)
				}

				return
			}

			if (e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED) {
				setRecordingState(RecordingState.PENDING_CANCEL)
				return
			}
		},
		[
			recordingState,
			clearHelpMessageValue,
			setHelpMessageValue,
			t,
			updateCurrentTime,
			addMeteredValue,
		],
	)

	return (
		<View style={[padding.top.medium, { flexDirection: 'row' }]}>
			{helpMessage !== '' && (
				<TouchableOpacity
					style={{ position: 'absolute', top: -30, right: 0 }}
					onPress={() => clearHelpMessageValue()}
				>
					<View
						style={[
							{
								backgroundColor: color.blue,
							},
							padding.small,
							border.radius.small,
							margin.right.small,
						]}
					>
						<Text style={{ color: color.white }}>{helpMessage}</Text>
					</View>
				</TouchableOpacity>
			)}
			{isRecording && (
				<RecordingComponent
					recordingState={recordingState}
					recordingColorVal={recordingColorVal}
					setRecordingState={setRecordingState}
					setHelpMessageValue={setHelpMessageValue}
					timer={currentTime - recordingStart}
				/>
			)}
			{recordingState === RecordingState.PREVIEW && (
				<PreviewComponent
					meteredValuesRef={meteredValuesRef}
					recordDuration={recordDuration}
					recordFilePath={recorderFilePath}
					clearRecordingInterval={clearRecordingInterval}
					setRecordingState={setRecordingState}
					setHelpMessageValue={setHelpMessageValue}
				/>
			)}
			{recordingState === RecordingState.NOT_RECORDING && (
				<View style={[padding.left.scale(10), { flex: 1 }]}>{children}</View>
			)}
			{(recordingState === RecordingState.NOT_RECORDING ||
				recordingState === RecordingState.RECORDING) && (
				<LongPressGestureHandler
					minDurationMs={0}
					maxDist={100 * scaleSize}
					onGestureEvent={updateRecordingPressEvent}
					onHandlerStateChange={recordingPressStatus}
				>
					<Animated.View
						style={[
							{
								right: aFixMicro,
								justifyContent: 'center',
								alignItems: 'flex-end',
								paddingRight: 15 * scaleSize,
							},
						]}
					>
						{recordingState === RecordingState.RECORDING && (
							<View
								style={{
									justifyContent: 'center',
									alignItems: 'center',
									borderRadius: 100,
									backgroundColor: color.blue,
									width: 36 * scaleSize,
									height: 36 * scaleSize,
									position: 'absolute',
									top: -distanceLock - 30,
									right: 16,
									paddingVertical: 5,
								}}
							>
								<Icon
									name='lock'
									pack='feather'
									height={20 * scaleSize}
									width={20 * scaleSize}
									fill={color.white}
								/>
							</View>
						)}
						<View>{component}</View>
					</Animated.View>
				</LongPressGestureHandler>
			)}
		</View>
	)
}
