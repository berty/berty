import React, { useEffect, useState } from 'react'
import {
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
	StyleSheet,
	Animated,
} from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { Text, Icon } from '@ui-kitten/components'
import DocumentPicker from 'react-native-document-picker'
import { Player, Recorder } from '@react-native-community/audio-toolkit'
import moment from 'moment'

enum RecorderState {
	Default,
	Recording,
	Recorded,
}

const ListItem: React.FC<{
	title: string
	onPress: () => void
	iconProps: {
		name: string
		fill: string
		height: number
		width: number
		pack?: string
	}
}> = ({ title, iconProps, onPress }) => {
	const [{ padding, text }] = useStyles()

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[
				padding.vertical.medium,
				padding.horizontal.large,
				{ flexDirection: 'row', alignItems: 'center' },
			]}
		>
			<Icon {...iconProps} />
			<Text style={[text.align.center, { flex: 1, paddingRight: 40 }]}>{title}</Text>
		</TouchableOpacity>
	)
}

let player = new Player('tempVoiceClip.aac')
let recorder: Recorder

export const AddFileMenu: React.FC<{ close: () => void }> = ({ close }) => {
	const [{ color, border, padding, text, margin }, { windowWidth }] = useStyles()
	const { t }: { t: any } = useTranslation()
	// const [recorderFilePath, setRecorderFilePath] = useState('')
	const [recorderState, setRecorderState] = useState(RecorderState.Default)
	const [recordStartTime, setRecordStartTime] = useState<null | moment.Moment>(moment())
	const [recordStopTime, setRecordStopTime] = useState<null | moment.Moment>(moment())
	const [refresh, setRefresh] = useState(0)
	const [intervalId, setIntervalId] = useState<any>()
	const [animatedWidth] = useState(new Animated.Value(0))

	const startTimer = () => {
		setIntervalId(setInterval(() => setRefresh((timer) => timer + 1), 500))
	}

	useEffect(() => {
		if (player?.isPlaying) {
			Animated.timing(animatedWidth, {
				toValue:
					((player.currentTime === -1 ? player.duration : player.currentTime) / player.duration) *
					windowWidth,
				duration: 200,
				useNativeDriver: false,
			}).start()
		} else if (!recorder?.isRecording && player?.isStopped) {
			Animated.timing(animatedWidth, {
				toValue: windowWidth,
				duration: 100,
				useNativeDriver: false,
			}).start(() => {
				Animated.timing(animatedWidth, {
					toValue: 0,
					duration: 100,
					useNativeDriver: false,
				}).start()
			})
			console.log('[l;ayer stopped')
			intervalId && clearInterval(intervalId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refresh])

	const recordingDuration = recordStartTime && (recordStopTime || moment()).diff(recordStartTime)

	const LIST_CONFIG = [
		{
			iconProps: {
				name: 'add-picture',
				fill: '#C7C8D8',
				height: 40,
				width: 40,
				pack: 'custom',
			},
			title: t('chat.files.media'),
			onPress: async () => {
				try {
					const res = await DocumentPicker.pickMultiple({
						type: ['*/*'],
					})
					console.log(res)
				} catch (err) {
					if (DocumentPicker.isCancel(err)) {
					} else {
						console.error(err)
					}
				}
			},
		},
		{
			iconProps: {
				name: 'bertyzzz',
				fill: 'white',
				height: 40,
				width: 40,
				pack: 'custom',
			},
			title: t('chat.files.emojis'),
			onPress: () => {},
		},
	]

	let RECORD_CONFIG = {
		backgroundColor: 'white',
		iconProps: {
			name: 'microphone',
			pack: 'custom',
			fill: '#C7C8D8',
		},
	}

	if (recorderState === RecorderState.Recording) {
		RECORD_CONFIG = {
			backgroundColor: '#F89A9A',
			iconProps: {
				name: 'microphone',
				pack: 'custom',
				fill: '#F65B77',
			},
		}
	} else if (recorderState === RecorderState.Recorded) {
		RECORD_CONFIG = {
			backgroundColor: '#6B80FF',
			iconProps: {
				name: 'paper-plane-outline',
				fill: '#5360CC',
				pack: '',
			},
		}
	}

	let duration = '00:00'

	if (recorderState === RecorderState.Recorded && !player.isStopped) {
		duration = moment.utc(player.currentTime).format('mm:ss')
	} else if (recordingDuration) {
		duration = moment.utc(recordingDuration).format('mm:ss')
	}

	return (
		<View
			style={[
				StyleSheet.absoluteFill,
				{
					zIndex: 9,
					elevation: 9,
				},
			]}
		>
			<TouchableOpacity style={{ flex: 1 }} onPress={close}>
				<View />
			</TouchableOpacity>
			<View
				style={[
					{
						position: 'absolute',
						bottom: 100,
						left: 0,
						right: 0,
						width: '100%',
						backgroundColor: color.white,
					},
					border.radius.top.large,
					border.shadow.big,
				]}
			>
				<TouchableWithoutFeedback
					onPressIn={() => {
						if (recorderState !== RecorderState.Default) {
							return
						}

						recorder = new Recorder('tempVoiceClip.aac').prepare((err, filePath) => {
							if (err) {
								console.log('recorder prepare error', err?.message)
							}
							console.log(filePath)
							// setRecorderFilePath(filePath)
						})
						recorder.record((err) => {
							if (err) {
								err && console.log('record err', err?.message)
							} else {
								setRecorderState(RecorderState.Recording)
								setRecordStartTime(moment())
								setRecordStopTime(null)
								startTimer()
							}
						})
					}}
					onPressOut={() => {
						if (recorderState !== RecorderState.Recording) {
							return
						}
						recorder.stop(() => {
							player.prepare()
							recorder?.destroy()
						})
						setRecorderState(
							recorderState === RecorderState.Recording
								? RecorderState.Recorded
								: RecorderState.Default,
						)
						setRecordStopTime(moment())
						clearInterval(intervalId)
					}}
				>
					<View
						style={[
							padding.vertical.medium,
							padding.horizontal.large,
							border.radius.top.large,
							{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: RECORD_CONFIG.backgroundColor,
								width: '100%',
								flex: 1,
							},
						]}
					>
						<View
							style={
								recorderState !== RecorderState.Default && {
									flex: 1,
								}
							}
						>
							<Icon
								height={40}
								width={40}
								{...RECORD_CONFIG.iconProps}
								style={{
									alignSelf: 'flex-start',
									flex: 1,
								}}
							/>
						</View>

						{recorderState !== RecorderState.Recorded && (
							<View
								style={
									recorderState === RecorderState.Default
										? { width: '100%' }
										: {
												flex: 2,
												alignItems: 'center',
												justifyContent: 'center',
										  }
								}
							>
								<Text
									style={[
										text.align.center,
										recorderState === RecorderState.Default && {
											paddingRight: 80,
										},
									]}
								>
									{recorderState === RecorderState.Recording
										? t('chat.files.recording')
										: t('chat.files.record-sound')}
								</Text>
							</View>
						)}

						{recorderState === RecorderState.Recorded && (
							<View
								style={{
									flex: 1,
								}}
							>
								<TouchableOpacity
									onPress={() => {
										if (player?.isPlaying) {
											player.pause()
										} else if (player?.isPaused) {
											player.seek(player.currentTime, (err) => {
												if (err) {
													console.log(err?.message)
												}
												player.playPause()
											})
										} else {
											player.play((err) => {
												if (err) {
												} else {
													startTimer()
												}
											})
										}
									}}
									style={[
										padding.vertical.tiny,
										padding.horizontal.big,
										border.radius.small,
										{
											backgroundColor: '#4F58C0',
											alignSelf: 'center',
											alignItems: 'center',
											justifyContent: 'center',
										},
									]}
								>
									<Icon
										name={player?.isPlaying ? 'pause' : 'play'}
										fill='white'
										height={30}
										width={30}
										pack='custom'
									/>
								</TouchableOpacity>
							</View>
						)}
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
							}}
						>
							{recorderState !== RecorderState.Default && (
								<View
									style={[
										padding.vertical.tiny,
										padding.horizontal.small,
										border.radius.small,
										{
											backgroundColor:
												recorderState === RecorderState.Recorded ? '#4F58C0' : '#F6617A',
										},
									]}
								>
									<Text style={{ color: color.white }}>{duration}</Text>
								</View>
							)}
							{recorderState === RecorderState.Recorded && (
								<TouchableOpacity
									onPress={() => {
										setRecorderState(RecorderState.Default)
										recorder?.destroy()
										setRecordStartTime(null)
										setRecordStopTime(null)
										player?.stop()
									}}
									style={[padding.tiny, margin.left.small]}
								>
									<Icon name='close-circle-outline' fill='#A1AEFF' height={30} width={30} />
								</TouchableOpacity>
							)}
						</View>
						{recorderState === RecorderState.Recorded && (
							<View
								style={{
									position: 'absolute',
									bottom: 0,
									left: 0,
									right: 0,
									backgroundColor: '#8999FF',
									height: 5,
								}}
							>
								<Animated.View
									style={[
										{
											position: 'absolute',
											bottom: 0,
											left: 0,
											right: 0,
											backgroundColor: '#3F49EA',
											height: 5,
											width: animatedWidth,
										},
										Number(animatedWidth).toFixed(2) !== windowWidth.toFixed(2) &&
											border.radius.right.tiny,
									]}
								/>
							</View>
						)}
					</View>
				</TouchableWithoutFeedback>
				{LIST_CONFIG.map((listItem) => (
					<ListItem {...listItem} key={listItem.title} />
				))}
			</View>
		</View>
	)
}
