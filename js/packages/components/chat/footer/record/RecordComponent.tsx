import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Platform, TouchableOpacity, Vibration, View } from 'react-native'
import {
	LongPressGestureHandler,
	LongPressGestureHandlerGestureEvent,
	LongPressGestureHandlerStateChangeEvent,
	State,
} from 'react-native-gesture-handler'
import { Recorder } from '@react-native-community/audio-toolkit'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { RESULTS } from 'react-native-permissions'
import Long from 'long'

import { WelshMessengerServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { useStyles } from '@berty/contexts/styles'
import beapi from '@berty/api'
import { playSound } from '@berty/store/sounds'
import { useMessengerClient, useThemeColor } from '@berty/store'
import rnutil from '@berty/rnutil'
import { AppDispatch } from '@berty/redux/store'
import { useAppDispatch } from '@berty/hooks'

import {
	limitIntensities,
	RecordingState,
	volumeValuesAttached,
	volumeValueLowest,
	volumeValuePrecision,
} from '../../audioMessageCommon'
import { RecordingComponent } from './RecordingComponent'
import { PreviewComponent } from './PreviewComponent'
import { UnifiedText } from '../../../shared-components/UnifiedText'
import { PermissionType } from '@berty/rnutil/checkPermissions'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

enum MicPermStatus {
	UNDEFINED = 0,
	GRANTED = 1,
	NEWLY_GRANTED = 2,
	DENIED = 3,
}

const voiceMemoBitrate = 32000
const voiceMemoSampleRate = 22050
const voiceMemoFormat = 'aac'

const acquireMicPerm = async (navigate: any): Promise<MicPermStatus> => {
	const permissionStatus = await rnutil.checkPermissions(PermissionType.audio, {
		navigate,
		navigateToPermScreenOnProblem: true,
	})
	if (permissionStatus === RESULTS.GRANTED) {
		return MicPermStatus.GRANTED
	}

	return MicPermStatus.UNDEFINED
}

const sendMessage = async (
	client: WelshMessengerServiceClient,
	convPk: string,
	dispatch: AppDispatch,
	opts: {
		body?: string
		medias?: beapi.messenger.IMedia[]
	},
) => {
	try {
		const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: opts.body || '' }).finish()
		const reply = await client.interact({
			conversationPublicKey: convPk,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
			payload: buf,
			mediaCids: opts.medias?.filter(media => media.cid).map(media => media.cid) as string[],
		})
		const optimisticInteraction: beapi.messenger.IInteraction = {
			cid: reply.cid,
			conversationPublicKey: convPk,
			isMine: true,
			type: beapi.messenger.AppMessage.Type.TypeUserMessage,
			payload: buf,
			medias: opts.medias,
			sentDate: Long.fromNumber(Date.now()).toString() as unknown as Long,
		}
		dispatch({
			type: 'messenger/InteractionUpdated',
			payload: { interaction: optimisticInteraction },
		})
		playSound('messageSent')
	} catch (e) {
		console.warn('error sending message:', e)
	}
}

interface Attachment extends beapi.messenger.IMedia {
	uri?: string
}

const attachMedias = async (client: WelshMessengerServiceClient, res: Attachment[]) =>
	(
		await Promise.all(
			res.map(async doc => {
				const stream = await client?.mediaPrepare({})
				console.log(
					'sending:',
					beapi.messenger.AudioPreview.decode(
						beapi.messenger.MediaMetadata.decode(doc.metadataBytes!).items[0].payload!,
					),
				)
				await stream.emit({
					info: {
						filename: doc.filename,
						mimeType: doc.mimeType,
						displayName: doc.displayName || doc.filename || 'document',
						metadataBytes: doc.metadataBytes,
					},
					uri: doc.uri,
				})
				const reply = await stream.stopAndRecv()
				const optimisticMedia: beapi.messenger.IMedia = {
					cid: reply?.cid,
					filename: doc.filename,
					mimeType: doc.mimeType,
					displayName: doc.displayName || doc.filename || 'document',
					metadataBytes: doc.metadataBytes,
				}
				return optimisticMedia
			}),
		)
	).filter(media => !!media?.cid)

const audioMessageDisplayName = (startDate: Date): string =>
	`audiorec_${startDate.getFullYear()}:${startDate.getMonth()}:${startDate.getDate()}:${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}`

export const RecordComponent: React.FC<{
	convPk: string
	component: React.ReactNode
	distanceCancel?: number
	distanceLock?: number
	minAudioDuration?: number
	disableLockMode?: boolean
	disabled?: boolean
	sending?: boolean
	setSending: (val: boolean) => void
}> = ({
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
	const { navigate } = useNavigation()

	const { border, padding, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
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
	//const [xy, setXY] = useState({ x: 0, y: 0 })
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
				recorder.current?.stop(err => {
					const duration = recordDuration || Date.now() - recordingStart

					if (err !== null) {
						if (duration) {
							if (duration >= minAudioDuration) {
								sendComplete({ duration, start: recordingStart })
							}
						} else {
							console.warn(err)
						}
					} else if (duration < minAudioDuration) {
						setHelpMessageValue({
							message: t('audio.record.tooltip.usage'),
						})
					} else {
						sendComplete({ duration, start: recordingStart })
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
		client,
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
			distanceCancel,
			distanceLock,
			recordingState,
			setHelpMessageValue,
			t,
			disabled,
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
			recordingState,
			navigate,
			clearHelpMessageValue,
			setHelpMessageValue,
			t,
			updateCurrentTime,
			addMeteredValue,
			disabled,
		],
	)

	return Platform.OS === 'web' ? (
		<View style={[padding.left.scale(10), { flex: 1 }]}>{children}</View>
	) : (
		<View style={[{ flexDirection: 'row' }]}>
			{helpMessage !== '' && (
				<TouchableOpacity
					style={{ position: 'absolute', top: -30, right: 0, zIndex: 42000 }}
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
						<UnifiedText style={{ color: colors['reverted-main-text'] }}>{helpMessage}</UnifiedText>
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
			{(recordingState === RecordingState.NOT_RECORDING ||
				recordingState === RecordingState.PENDING_CANCEL) && (
				<View style={[padding.left.scale(10), { flex: 1 }]}>{children}</View>
			)}
			{(recordingState === RecordingState.NOT_RECORDING ||
				recordingState === RecordingState.RECORDING ||
				recordingState === RecordingState.PENDING_CANCEL) && (
				<LongPressGestureHandler
					minDurationMs={0}
					maxDist={42000}
					onGestureEvent={updateRecordingPressEvent}
					onHandlerStateChange={recordingPressStatus}
					shouldCancelWhenOutside={false}
				>
					<View
						style={[
							{
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
									borderRadius: 18 * scaleSize,
									borderWidth: 1,
									borderColor: `${colors['reverted-main-text']}c0`,
									backgroundColor: colors['background-header'],
									width: 36 * scaleSize,
									height: 36 * scaleSize,
									position: 'absolute',
									top: -distanceLock - 30,
									right: 16,
									paddingVertical: 5,
								}}
							>
								<View style={{ paddingBottom: 2 * scaleSize }}>
									<Icon
										name='lock'
										pack='feather'
										height={18 * scaleSize}
										width={18 * scaleSize}
										fill={colors['reverted-main-text']}
									/>
								</View>
							</View>
						)}
						<View>{component}</View>
					</View>
				</LongPressGestureHandler>
			)}
		</View>
	)
}
