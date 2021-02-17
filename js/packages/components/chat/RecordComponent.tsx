import React, { useCallback, useEffect, useState } from 'react'
import { Animated, Platform, Text, TouchableOpacity, Vibration, View } from 'react-native'
import {
	LongPressGestureHandler,
	LongPressGestureHandlerGestureEvent,
	LongPressGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler'
import { useStyles } from '@berty-tech/styles'
import moment from 'moment'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { Recorder } from '@react-native-community/audio-toolkit'
import beapi from '@berty-tech/api'
import { playSound } from '@berty-tech/components/sounds'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { useTranslation } from 'react-i18next'

enum RecordingState {
	UNDEFINED = 0,
	NOT_RECORDING = 1,
	RECORDING = 2,
	RECORDING_LOCKED = 3,
	PENDING_CANCEL = 4,
	CANCELLING = 5,
	COMPLETE = 7,
}

enum MicPermStatus {
	UNDEFINED = 0,
	GRANTED = 1,
	NEWLY_GRANTED = 2,
	DENIED = 3,
}

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
	style?: any
	distanceCancel?: number
	distanceLock?: number
	minAudioDuration?: number
	disableLockMode?: boolean
}> = ({
	children,
	style = [],
	distanceCancel = 200,
	distanceLock = 100,
	disableLockMode = false,
	minAudioDuration = 1000,
	convPk,
}) => {
	const ctx = useMsgrContext()
	const recorder = React.useRef<Recorder | undefined>(undefined)
	const [recorderFilePath, setRecorderFilePath] = useState('')
	const { t } = useTranslation()

	const [{ border, padding, margin, color }] = useStyles()
	const [recordingState, setRecordingState] = useState(RecordingState.NOT_RECORDING)
	const [recordingStart, setRecordingStart] = useState(Date.now())
	const [clearRecordingInterval, setClearRecordingInterval] = useState<any | null>(null)
	const [xy, setXY] = useState({ x: 0, y: 0 })
	const [currentTime, setCurrentTime] = useState(Date.now())
	const [helpMessageTimeoutID, _setHelpMessageTimeoutID] = useState<ReturnType<
		typeof setTimeout
	> | null>(null)
	const [helpMessage, _setHelpMessage] = useState('')
	const recordingColorVal = React.useRef(new Animated.Value(0)).current

	const isRecording =
		recordingState === RecordingState.RECORDING ||
		recordingState === RecordingState.RECORDING_LOCKED

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
	}, [clearRecordingInterval])

	useEffect(() => {
		switch (recordingState) {
			case RecordingState.PENDING_CANCEL:
				Vibration.vibrate(200)
				break

			case RecordingState.CANCELLING:
				recorder.current?.stop(() => {
					recorder.current?.destroy()
				})

				clearRecording()
				break

			case RecordingState.COMPLETE:
				recorder.current?.stop(() => {
					recorder.current?.destroy()
				})

				if (Date.now() - recordingStart < minAudioDuration) {
					setHelpMessageValue({
						message: t('audio.record.tooltip.usage'),
					})
				} else {
					Vibration.vibrate(400)
					attachMedias(ctx.client!, [
						{
							filename: 'audio_memo.aac',
							mimeType: 'audio/aac',
							uri: recorderFilePath,
						},
					])
						.then((cids) => {
							return sendMessage(ctx.client!, convPk, { medias: cids })
						})
						.catch((e) => console.warn(e))
				}

				clearRecording()
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
				if (recordingState === RecordingState.RECORDING_LOCKED) {
					if (xy.x > -distanceCancel && xy.y > -20 && xy.y < 70) {
						setRecordingState(RecordingState.CANCELLING)
						return
					}

					setRecordingState(RecordingState.COMPLETE)
					return
				}

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

					recorder.current = new Recorder('tempVoiceClip.aac', {
						channels: 1,
						bitrate: 32000,
						sampleRate: 22050,
						format: 'aac',
						encoder: 'aac',
						quality: 'low',
						meteringInterval: 100,
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
							setRecordingState(RecordingState.RECORDING)
						}
					})
				}

				return
			}

			// Released
			if (e.nativeEvent.state === State.END) {
				if (recordingState === RecordingState.PENDING_CANCEL) {
					setRecordingState(RecordingState.CANCELLING)
				} else if (recordingState === RecordingState.RECORDING) {
					setRecordingState(RecordingState.COMPLETE)
				}

				return
			}

			if (e.nativeEvent.state === State.CANCELLED || e.nativeEvent.state === State.FAILED) {
				setRecordingState(RecordingState.CANCELLING)
				return
			}
		},
		[
			recordingState,
			xy.x,
			xy.y,
			distanceCancel,
			clearHelpMessageValue,
			setHelpMessageValue,
			t,
			updateCurrentTime,
		],
	)

	return (
		<>
			{helpMessage !== '' && (
				<TouchableOpacity
					style={{
						position: 'absolute',
						top: -30,
						right: 0,
					}}
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
				<>
					<View
						style={[
							{
								backgroundColor: color.red,
								position: 'absolute',
								right: 0,
								left: 0,
								top: 0,
								bottom: 0,
								justifyContent: 'center',
							},
							padding.small,
							border.radius.small,
							margin.right.small,
						]}
					>
						<Text style={{ color: color.white }}>
							{moment.utc(currentTime - recordingStart).format('mm:ss')}
						</Text>
					</View>
					<Animated.View
						style={[
							{
								backgroundColor: color.white,
								position: 'absolute',
								right: 0,
								left: 0,
								top: 0,
								bottom: 0,
								opacity: recordingColorVal.interpolate({
									inputRange: [0, 1],
									outputRange: [0, 0.2],
								}),
							},
							padding.small,
							border.radius.small,
							margin.right.small,
						]}
					/>
					<View
						style={[
							{
								position: 'absolute',
								width: distanceCancel,
								right: 38,
							},
							padding.small,
							border.radius.small,
							margin.right.small,
							recordingState === RecordingState.RECORDING_LOCKED ? border.color.light.grey : null,
							recordingState === RecordingState.RECORDING_LOCKED ? border.scale(2) : null,
						]}
					>
						{recordingState !== RecordingState.RECORDING_LOCKED ? (
							<Text style={{ color: color.black, fontWeight: 'bold' }}>
								{t('audio.record.slide-to-cancel')}
							</Text>
						) : (
							<TouchableOpacity
								onPress={() => {
									setHelpMessageValue({
										message: t('audio.record.tooltip.not-sent'),
									})
									setRecordingState(RecordingState.CANCELLING)
								}}
							>
								<Text
									style={{
										color: color.black,
										fontWeight: 'bold',
										textAlign: 'center',
									}}
								>
									{t('audio.record.cancel-button')}
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</>
			)}
			<LongPressGestureHandler
				minDurationMs={0}
				maxDist={100}
				onGestureEvent={updateRecordingPressEvent}
				onHandlerStateChange={recordingPressStatus}
			>
				<Animated.View style={[style]}>
					{isRecording && (
						<>
							{!disableLockMode && recordingState !== RecordingState.RECORDING_LOCKED && (
								<View
									style={[
										{
											backgroundColor: '#0f0',
											position: 'absolute',
											top: -distanceLock - 30,
											height: 30,
										},
									]}
								>
									<Text>Lock</Text>
								</View>
							)}
						</>
					)}
					<View>{children}</View>
				</Animated.View>
			</LongPressGestureHandler>
		</>
	)
}
