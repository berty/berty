import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Text, TouchableOpacity, Vibration, View } from 'react-native'
import {
	LongPressGestureHandler,
	LongPressGestureHandlerGestureEvent,
	LongPressGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler'
import { Recorder } from '@react-native-community/audio-toolkit'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'

import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { playSound } from '@berty-tech/store/sounds'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'

import {
	limitIntensities,
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
	voiceMemoFilename,
} from './common'

import { checkPermissions } from '@berty-tech/components/utils'
import { RESULTS } from 'react-native-permissions'
import LottieView from 'lottie-react-native'
import { Visualizer } from './Visualizer'
import trashLottie from '@berty-tech/assets/trash-lottie.json'

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
	const permissionStatus = await checkPermissions('audio')
	if (permissionStatus === RESULTS.GRANTED) {
		return MicPermStatus.GRANTED
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
	aFixMicro: Animated.AnimatedInterpolation
	microOpacity: Animated.AnimatedInterpolation
	microScale: Animated.AnimatedInterpolation
	microTranslate: Animated.AnimatedInterpolation
	trashOpacity: Animated.AnimatedInterpolation
	trashTranslate: Animated.AnimatedInterpolation
	trashScale: Animated.AnimatedInterpolation
	trashAnimationProgress: Animated.AnimatedInterpolation
	microBorderScale: Animated.AnimatedInterpolation
	distanceCancel?: number
	distanceLock?: number
	minAudioDuration?: number
	disableLockMode?: boolean
	onStartRecording: () => void
	onStopRecording: () => void
	onDeleteRecording: (callback: any) => void
}> = ({
	children,

	aFixMicro,
	distanceCancel = 200,
	distanceLock = 70,
	disableLockMode = false,
	minAudioDuration = 1000,
	convPk,
	microOpacity,
	microScale,
	microTranslate,
	trashOpacity,
	trashTranslate,
	trashScale,
	trashAnimationProgress,

	onStopRecording,
	onStartRecording,
	onDeleteRecording,
}) => {
	const ctx = useMsgrContext()
	const recorder = React.useRef<Recorder | undefined>(undefined)
	const [recorderFilePath, setRecorderFilePath] = useState('')
	const { t } = useTranslation()

	const [{ border, padding, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
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
	const lottieRef = useRef(null)
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
		meteredValuesRef.current = []
		clearInterval(clearRecordingInterval)
		setRecordingState(RecordingState.NOT_RECORDING)
		onStopRecording()
		setRecordDuration(null)
		;(recorder.current as any)?.removeListener('meter', addMeteredValue)
	}, [addMeteredValue, clearRecordingInterval, onStopRecording])

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
						if (duration) {
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

				onDeleteRecording(() => setRecordingState(RecordingState.PENDING_CANCEL))

				return
			}

			if (!disableLockMode && e.nativeEvent.y < -distanceLock && xy.x > -20 && xy.x < 50) {
				setRecordingState(RecordingState.RECORDING_LOCKED)
				return
			}
		},
		[
			disableLockMode,
			distanceCancel,
			distanceLock,
			recordingState,
			setHelpMessageValue,
			t,
			xy.x,
			onDeleteRecording,
		],
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
							onStartRecording()
						}
					})
				}

				if (recordingState === RecordingState.RECORDING_LOCKED) {
					setRecordingState(RecordingState.COMPLETE)
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
				onDeleteRecording(() => setRecordingState(RecordingState.PENDING_CANCEL))
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
			onStartRecording,
			onDeleteRecording,
		],
	)

	const getBorderScale = () => {
		if (!meteredValuesRef.current.length) {
			return 1.05
		}
		let meterScaleValue =
			(5 - Math.log(-meteredValuesRef.current[meteredValuesRef.current.length - 1])) / 1.5

		if (meterScaleValue < 1.05) {
			return 1.05
		} else if (meterScaleValue > 2) {
			return 2
		}
		return meterScaleValue
	}

	return (
		<View style={[{ flexDirection: 'row' }]}>
			{helpMessage !== '' && (
				<TouchableOpacity
					style={{ position: 'absolute', top: -30, right: 0 }}
					onPress={() => clearHelpMessageValue()}
				>
					<View
						style={[
							{ backgroundColor: colors['background-header'] },
							padding.small,
							border.radius.small,
							margin.right.small,
						]}
					>
						<Text style={{ color: colors['reverted-main-text'] }}>{helpMessage}</Text>
					</View>
				</TouchableOpacity>
			)}

			<Animated.View
				style={[
					{
						opacity: trashOpacity,
						zIndex: 102,
						alignItems: 'center',
						left: (37 + 20) * scaleSize,
						position: 'absolute',
						transform: [
							{
								translateX: trashTranslate,
							},
							{
								scale: trashScale,
							},
						],
					},
				]}
			>
				<TouchableOpacity
					style={{
						height: 37 * scaleSize,
						width: 37 * scaleSize,
						backgroundColor: colors['background-header'],
						borderRadius: 30 * scaleSize,
						zIndex: 9999,
					}}
					onPress={() => {
						onDeleteRecording(() => setRecordingState(RecordingState.PENDING_CANCEL))
					}}
				>
					<LottieView
						source={trashLottie}
						autoPlay={false}
						ref={lottieRef}
						progress={trashAnimationProgress}
					/>
				</TouchableOpacity>
			</Animated.View>

			<View style={[padding.left.scale(10), { flex: 1 }]}>
				{children}
				{isRecording && <Visualizer data={meteredValuesRef.current} recordDuration={currentTime} />}
			</View>

			<LongPressGestureHandler
				minDurationMs={0}
				maxDist={100 * scaleSize}
				onGestureEvent={updateRecordingPressEvent}
				onHandlerStateChange={recordingPressStatus}
			>
				<View>
					{isRecording && recordingState !== RecordingState.RECORDING_LOCKED && (
						<View
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								borderRadius: 100,
								backgroundColor: colors['background-header'],
								width: 36 * scaleSize,
								height: 36 * scaleSize,
								position: 'absolute',
								top: -distanceLock - 30,
								right: 34,
								paddingVertical: 5,
							}}
						>
							<Icon
								name='lock'
								pack='feather'
								height={20 * scaleSize}
								width={20 * scaleSize}
								fill={colors['reverted-main-text']}
							/>
						</View>
					)}

					<Animated.View
						style={[
							{
								right: aFixMicro,
								justifyContent: 'center',
								alignItems: 'flex-end',
								paddingRight: 15 * scaleSize,
								zIndex: 101,
								opacity: microOpacity,
								transform: [
									{
										scale: microScale,
									},
									{
										translateX: microTranslate,
									},
								],
							},
						]}
					>
						<Animated.View
							style={{
								height: 36 * scaleSize,
								width: 36 * scaleSize,
								position: 'absolute',
								backgroundColor: `${colors['background-header']}70`,
								borderRadius: 100,
								left: 0,
								right: 0,
								transform: [
									{
										scale: getBorderScale(),
									},
								],
							}}
						/>

						<Animated.View
							style={[
								{
									justifyContent: 'center',
									alignItems: 'center',
									borderRadius: 100,
									backgroundColor: colors['background-header'],
									height: 36 * scaleSize,
									width: 36 * scaleSize,

									zIndex: 101,
								},
							]}
						>
							{recordingState === RecordingState.RECORDING_LOCKED ? (
								<Icon
									name='paper-plane-outline'
									height={12 * scaleSize}
									width={12 * scaleSize}
									fill={colors['reverted-main-text']}
								/>
							) : (
								<Icon
									name='microphone-footer'
									pack='custom'
									width={20 * scaleSize}
									height={20 * scaleSize}
									fill={colors['reverted-main-text']}
								/>
							)}
						</Animated.View>
					</Animated.View>
				</View>
			</LongPressGestureHandler>
		</View>
	)
}
