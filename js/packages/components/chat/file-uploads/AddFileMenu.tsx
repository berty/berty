import React, { useEffect, useState } from 'react'
import {
	View,
	Animated,
	Modal,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
} from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import { Text, Icon } from '@ui-kitten/components'
import DocumentPicker from 'react-native-document-picker'
import { Player, Recorder } from '@react-native-community/audio-toolkit'
import moment from 'moment'
import ImagePicker from 'react-native-image-crop-picker'
import { request, check, RESULTS, PERMISSIONS } from 'react-native-permissions'
import beapi from '@berty-tech/api'

import { MenuListItem } from './MenuListItem'
import { GallerySection } from './GallerySection'
import { GifSection } from './GifSection'
import { RecorderState, TabItems } from './types'
import { SecurityAccess } from './SecurityAccess'
let audioFilename = 'tempVoiceClip.aac'
let player = new Player(audioFilename)
let recorder: Recorder
import { useClient } from '@berty-tech/store/hooks'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const AddFileMenu: React.FC<{ onClose: (medias?: string[]) => void }> = ({ onClose }) => {
	const [{ color, border, padding, margin }, { windowWidth }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const [recorderFilePath, setRecorderFilePath] = useState('')
	const [recorderState, setRecorderState] = useState(RecorderState.Default)
	const [recordStartTime, setRecordStartTime] = useState<null | moment.Moment>(moment())
	const [recordStopTime, setRecordStopTime] = useState<null | moment.Moment>(moment())
	const [refresh, setRefresh] = useState(0)
	const [intervalId, setIntervalId] = useState<any>()
	const [animatedWidth] = useState(new Animated.Value(0))
	const [activeTab, setActiveTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const client = useClient()

	useEffect(() => {
		if (player?.isPlaying) {
			Animated.timing(animatedWidth, {
				toValue:
					((player.currentTime === -1 ? player.duration : player.currentTime) / player.duration) *
					windowWidth *
					1.1,
				duration: 100,
				useNativeDriver: false,
			}).start()
		} else if (!recorder?.isRecording && player?.isStopped) {
			Animated.timing(animatedWidth, {
				toValue: 0,
				duration: 100,
				useNativeDriver: false,
			}).start()

			intervalId && clearInterval(intervalId)
		}
	}, [animatedWidth, intervalId, refresh, windowWidth])

	const recordingDuration = recordStartTime && (recordStopTime || moment()).diff(recordStartTime)

	const LIST_CONFIG = [
		{
			iconProps: {
				name: 'gallery',
				fill: activeTab === TabItems.Gallery ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.gallery'),
			onPress: async () => {
				if (Platform.OS === 'ios') {
					try {
						const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
						if (status !== RESULTS.GRANTED) {
							try {
								const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
								if (status !== RESULTS.GRANTED) {
									setSecurityAccessVisibility(true)
									return
								}
							} catch (err) {
								console.log(err)
							}
						}
					} catch (err) {
						console.log(err)
					}
				}
				setActiveTab(TabItems.Gallery)
			},
		},
		{
			iconProps: {
				name: 'camera',
				fill: activeTab === TabItems.Camera ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.camera'),
			onPress: async () => {
				setActiveTab(TabItems.Camera)
				try {
					const status = await check(
						Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
					)
					if (status !== RESULTS.GRANTED) {
						try {
							const status = await request(
								Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
							)
							if (status !== RESULTS.GRANTED) {
								setSecurityAccessVisibility(true)
								return
							}
						} catch (err) {
							console.log(err)
						}
					}
				} catch (err) {
					console.log(err)
				}
				try {
					await ImagePicker.clean()
				} catch (err) {}
				try {
					const image = await ImagePicker.openCamera({
						cropping: false,
					})

					prepareMediaAndSend([
						{
							filename: '',
							uri: image.path || image.sourceURL || '',
							mimeType: image.mime,
						},
					])
				} catch (err) {
					console.log(err)
				}
			},
		},
		{
			iconProps: {
				name: 'microphone',
				fill: recorderState === RecorderState.Recording ? '#F65B77' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.record'),
			onPress: async () => {
				setActiveTab(TabItems.Record)
				try {
					const status = await check(
						Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
					)
					if (status !== RESULTS.GRANTED) {
						try {
							const status = await request(
								Platform.OS === 'ios'
									? PERMISSIONS.IOS.MICROPHONE
									: PERMISSIONS.ANDROID.RECORD_AUDIO,
							)
							if (status !== RESULTS.GRANTED) {
								setSecurityAccessVisibility(true)
								return
							}
						} catch (err) {
							console.log(err)
						}
					}
				} catch (err) {
					console.log(err)
				}

				if (recorderState === RecorderState.Recording) {
					stopRecording()
				} else if (recorderState === RecorderState.Default) {
					startRecording()
				}
			},
		},
		{
			iconProps: {
				name: 'files',
				fill: activeTab === TabItems.Files ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.files'),
			onPress: async () => {
				setActiveTab(TabItems.Files)
				try {
					const res = await DocumentPicker.pick({
						type: [DocumentPicker.types.allFiles],
					})
					prepareMediaAndSend([
						{
							filename: res.name,
							uri: res.uri,
							mimeType: res.type,
						},
					])
				} catch (err) {
					if (DocumentPicker.isCancel(err)) {
						// ignore
					}
				}
			},
		},
		{
			iconProps: {
				name: 'bertyzzz',
				fill: 'white',
				pack: 'custom',
			},
			title: 'Bertyzz!',
			onPress: () => {
				// setActiveTab(TabItems.Bertyzz)
			},
		},
		{
			iconProps: {
				name: 'gif',
				fill: activeTab === TabItems.GIF ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.gif'),
			onPress: async () => {
				setActiveTab(TabItems.GIF)
			},
		},
	]

	let duration = '00:00'
	if (recorderState === RecorderState.Recorded && !player?.isStopped) {
		duration = moment.utc(player?.currentTime).format('mm:ss')
	} else if (recordingDuration) {
		duration = moment.utc(recordingDuration).format('mm:ss')
	}
	const startTimer = () => {
		setIntervalId(setInterval(() => setRefresh((timer) => timer + 1), 100))
	}
	const startRecording = () => {
		recorder = new Recorder('tempVoiceClip.aac').prepare((err, filePath) => {
			if (err) {
				console.log('recorder prepare error', err?.message)
			}
			setRecorderFilePath(filePath)
		})
		recorder.record((err) => {
			if (err) {
				console.log('recorder record error', err?.message)
			} else {
				setRecorderState(RecorderState.Recording)
				setRecordStartTime(moment())
				setRecordStopTime(null)
				startTimer()
			}
		})
	}

	const stopRecording = () => {
		recorder?.stop(() => {
			player.prepare()
			recorder?.destroy()
		})
		setRecorderState(
			recorderState === RecorderState.Recording ? RecorderState.Recorded : RecorderState.Default,
		)
		setRecordStopTime(moment())
		intervalId && clearInterval(intervalId)
	}

	const prepareMediaAndSend = async (res: beapi.messenger.IMedia[]) => {
		const mediaCids = (
			await amap(res, async (doc) => {
				const stream = await client?.mediaPrepare({})
				await stream?.emit({
					info: { filename: doc.filename, mimeType: doc.mimeType, displayName: doc.filename },
					uri: doc.uri,
				})
				const reply = await stream?.stopAndRecv()
				return reply?.cid
			})
		).filter((cid) => !!cid)
		onClose(mediaCids)
	}

	return (
		<Modal
			transparent
			visible
			animationType='slide'
			style={{
				position: 'relative',
				flex: 1,
				height: '100%',
			}}
		>
			<TouchableOpacity
				style={{
					flex: 1,
				}}
				onPress={() => {
					player?.stop()
					recorder?.destroy()
					onClose()
				}}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'position' : 'height'}
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<View
					style={[
						{
							width: '100%',
						},
					]}
				>
					{isSecurityAccessVisible && (
						<SecurityAccess
							activeTab={activeTab}
							close={() => setSecurityAccessVisibility(false)}
						/>
					)}
					<View
						style={[
							{
								backgroundColor: color.white,
							},
							border.radius.top.large,
							border.shadow.big,
							padding.bottom.large,
						]}
					>
						{activeTab === TabItems.Record && recorderState === RecorderState.Recorded && (
							<View
								style={[
									padding.vertical.medium,
									padding.horizontal.large,
									border.radius.top.large,
									{
										flexDirection: 'row',
										alignItems: 'center',
										backgroundColor: '#6B80FF',
										width: '100%',
										flex: 1,
									},
								]}
							>
								<TouchableOpacity
									style={{
										flex: 1,
									}}
									onPress={() => {
										if (recorderState === RecorderState.Recorded) {
											prepareMediaAndSend([
												{
													filename: audioFilename,
													mimeType: 'audio/aac',
													uri: recorderFilePath,
												},
											])
										}
									}}
								>
									<Icon height={50} width={50} name='checkmark-circle-2' fill='#4F58C0' />
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => {
										if (player?.isPlaying) {
											player.pause()
										} else if (player?.isPaused) {
											player.playPause()
										} else {
											player = new Player('tempVoiceClip.aac')
											player.play((err) => {
												if (err) {
													console.log('player play', err?.message)
												} else {
													startTimer()
												}
											})
										}
									}}
									style={[
										border.radius.small,
										{
											backgroundColor: '#4F58C0',
											alignItems: 'center',
											justifyContent: 'center',
											height: 40,
											width: 100,
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

								<View
									style={{
										flex: 1,
										flexDirection: 'row',
										alignItems: 'center',
										justifyContent: 'flex-end',
									}}
								>
									<View
										style={[
											padding.vertical.tiny,
											padding.horizontal.small,
											border.radius.small,
											{
												backgroundColor: '#4F58C0',
											},
										]}
									>
										<Text style={{ color: color.white }}>{duration}</Text>
									</View>

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
								</View>

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
							</View>
						)}

						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{LIST_CONFIG.map((listItem) => (
								<MenuListItem {...listItem} key={listItem.title} />
							))}
						</View>

						{activeTab === TabItems.Gallery && (
							<GallerySection prepareMediaAndSend={prepareMediaAndSend} />
						)}
						{activeTab === TabItems.GIF && <GifSection prepareMediaAndSend={prepareMediaAndSend} />}
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	)
}
