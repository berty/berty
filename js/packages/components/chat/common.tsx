import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	TouchableOpacity,
	SafeAreaView,
	View,
	TextInput,
	NativeModules,
	Platform,
	ViewToken,
	Animated,
	Easing,
	Keyboard,
} from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import DeviceInfo from 'react-native-device-info'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useClient, useMsgrContext } from '@berty-tech/store/hooks'

import { AddFileMenu } from './file-uploads/AddFileMenu'
import { timeFormat } from '../helpers'
import { TabItems } from './file-uploads/types'
import BlurView from '../shared-components/BlurView'
import moment from 'moment'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import ImagePicker from 'react-native-image-crop-picker'
import { SecurityAccess } from './file-uploads/SecurityAccess'
import { RecordComponent } from './record/RecordComponent'

const {
	PlatformConstants: { interfaceIdiom: deviceType },
} = NativeModules

const isTablet = deviceType === 'pad'

//
// ChatFooter => Textinput for type message
//

// Styles
const useStylesChatFooter = () => {
	const [{ maxHeight, padding }] = useStyles()
	return {
		focusTextInput: maxHeight(80),
		sendButton: padding.left.scale(4),
	}
}

const aDuration = 600

// create interpolations
export const createAnimationInterpolation = (
	value: Animated.Value,
	outputRange: number[],
	inputRange?: number[],
) => {
	return value.interpolate({
		inputRange: inputRange || [0, 1],
		outputRange,
	})
}

// create animations
export const createAnimationTiming = (
	value: Animated.Value,
	toValue:
		| number
		| Animated.Value
		| Animated.ValueXY
		| { x: number; y: number }
		| Animated.AnimatedInterpolation,
	duration?: number,
) => {
	return Animated.timing(value, {
		toValue,
		duration: duration || aDuration,
		easing: Easing.linear,
		useNativeDriver: false,
	})
}

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const ChatFooter: React.FC<{
	isFocused: boolean
	setFocus: React.Dispatch<React.SetStateAction<any>>
	convPk: string
	disabled?: boolean
	placeholder: string
	setSwipe: (val: boolean) => void
}> = ({ isFocused, setFocus, convPk, disabled = false, placeholder, setSwipe }) => {
	const ctx = useMsgrContext()
	const client = useClient()

	const [message, setMessage] = useState('')
	const [showAddFileMenu, setShowAddFileMenu] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = isFocused || inputRef?.current?.isFocused() || false
	const _styles = useStylesChatFooter()
	const [{ padding, flex, border, margin, color, text, row }, { scaleSize }] = useStyles()
	const [mediaCids, setMediaCids] = useState<string[]>([])

	const [activateTab, setActivateTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const [isLoading, setLoading] = useState(false)

	const buf = beapi.messenger.AppMessage.UserMessage.encode({ body: message }).finish()

	const conversation = ctx.conversations[convPk]

	const isFake = (conversation as { fake: boolean }).fake
	const sendEnabled = !!(!isFake && (message || mediaCids.length > 0))

	const sendMessage = useCallback(
		(medias: string[] = []) => {
			ctx.client
				?.interact({
					conversationPublicKey: convPk,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
					mediaCids: medias,
				})
				.then(() => {
					setMessage('')
					setMediaCids([])
					ctx.playSound('messageSent')
				})
				.catch((e) => {
					console.warn('e sending message:', e)
				})
		},
		[buf, convPk, ctx],
	)

	// TODO: Debug, error on restarting node
	const handlePressSend = React.useCallback(() => {
		console.log('recompute handleSend', mediaCids)
		if (!sendEnabled) {
			return
		}
		sendMessage()
	}, [mediaCids, sendEnabled, sendMessage])

	const handleCloseFileMenu = (newMedias: string[] | undefined) => {
		if (newMedias) {
			sendMessage([...mediaCids, ...newMedias])
		}
		setShowAddFileMenu(false)
		setSwipe(true)
	}

	const prepareMediaAndSend = async (res: beapi.messenger.IMedia[]) => {
		if (isLoading) {
			return
		}
		setLoading(true)
		try {
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

			handleCloseFileMenu(mediaCids)
		} catch (err) {}
		setLoading(false)
	}

	let _isEmulator: boolean = false
	DeviceInfo.isEmulator().then((isEmulator) => {
		_isEmulator = isEmulator
	})

	// animations values
	const _aMaxWidth = useRef(new Animated.Value(0)).current
	const _aFixLeft = useRef(new Animated.Value(0)).current
	const _aFixMicro = useRef(new Animated.Value(0)).current
	const _aFixSend = useRef(new Animated.Value(0)).current
	const _aPaddingLeft = useRef(new Animated.Value(0)).current
	const _aOpacity = useRef(new Animated.Value(0)).current
	const _aOpacitySendButton = useRef(new Animated.Value(0)).current

	const aMaxWidth = createAnimationInterpolation(_aMaxWidth, [0, -(94 * scaleSize)])
	const aFixLeft = createAnimationInterpolation(_aFixLeft, [0, 45 * scaleSize])
	const aFixMicro = createAnimationInterpolation(_aFixMicro, [0 * scaleSize, -92 * scaleSize])
	const aFixSend = createAnimationInterpolation(_aFixMicro, [50, -45 * scaleSize])
	const aPaddingLeft = createAnimationInterpolation(_aPaddingLeft, [0, 45])
	const aOpacity = createAnimationInterpolation(_aOpacity, [1, 0])
	const aOpacitySendButton = createAnimationInterpolation(_aOpacity, [0, 1])

	const keyboardWillShow = useCallback(
		(event?: any) => {
			const duration = event?.duration || aDuration
			Animated.parallel([
				createAnimationTiming(_aMaxWidth, 1, duration),
				createAnimationTiming(_aFixLeft, 1, duration),
				createAnimationTiming(_aFixMicro, 1, duration),
				createAnimationTiming(_aFixSend, 1, duration),
				createAnimationTiming(_aPaddingLeft, 1, duration),
				createAnimationTiming(_aOpacity, 1, duration),
				createAnimationTiming(_aOpacitySendButton, 1, duration),
			]).start()
		},
		[_aMaxWidth, _aFixLeft, _aPaddingLeft, _aOpacity, _aFixMicro, _aOpacitySendButton, _aFixSend],
	)
	const keyboardWillHide = useCallback(
		(event?: any) => {
			const duration = event?.duration || aDuration
			Animated.parallel([
				createAnimationTiming(_aMaxWidth, 0, duration),
				createAnimationTiming(_aFixLeft, 0, duration),
				createAnimationTiming(_aFixMicro, 0, duration),
				createAnimationTiming(_aFixSend, 0, duration),
				createAnimationTiming(_aPaddingLeft, 0, duration),
				createAnimationTiming(_aOpacity, 0, duration),
				createAnimationTiming(_aOpacitySendButton, 0, duration),
			]).start()
		},
		[_aMaxWidth, _aFixLeft, _aPaddingLeft, _aOpacity, _aFixMicro, _aOpacitySendButton, _aFixSend],
	)
	useEffect(() => {
		if (_isEmulator) {
			if (_isFocused) {
				keyboardWillShow()
			} else {
				keyboardWillHide()
			}
		} else {
			const keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', keyboardWillShow)
			const keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', keyboardWillHide)
			return () => {
				keyboardWillShowSub.remove()
				keyboardWillHideSub.remove()
			}
		}
	}, [_isFocused, _isEmulator, keyboardWillHide, keyboardWillShow])

	if (!conversation) {
		return null
	}

	return (
		<BlurView blurType='light' blurAmount={30} style={{ overflow: 'visible' }}>
			<SafeAreaView style={[margin.bottom.medium, { zIndex: 10 }]}>
				{showAddFileMenu && <AddFileMenu onClose={handleCloseFileMenu} />}
				{isSecurityAccessVisible && (
					<SecurityAccess
						activeTab={activateTab}
						close={() => setSecurityAccessVisibility(false)}
					/>
				)}
				<RecordComponent
					aFixMicro={aFixMicro}
					component={
						<Animated.View
							style={[
								{
									justifyContent: 'center',
									alignItems: 'center',
									borderRadius: 100,
									backgroundColor: color.blue,
									width: 36 * scaleSize,
									height: 36 * scaleSize,
									opacity: aOpacity,
								},
							]}
						>
							<Icon
								name='microphone-footer'
								pack='custom'
								height={18 * scaleSize}
								width={18 * scaleSize}
								fill={color.white}
							/>
						</Animated.View>
					}
					convPk={convPk}
					disableLockMode={false}
				>
					<View
						style={[
							flex.tiny,
							border.radius.medium,
							Platform.OS === 'android' ? padding.horizontal.small : padding.small,
							row.fill,
							{
								alignItems: 'center',
								flexDirection: 'row',
							},
						]}
					>
						<TouchableOpacity
							style={[
								{
									backgroundColor: '#F7F8FF',
									zIndex: 3,
									elevation: 3,
									width: 37 * scaleSize,
									height: 37 * scaleSize,
									justifyContent: 'center',
									alignItems: 'center',
								},
								padding.small,
								border.radius.small,
							]}
							onPress={() => {
								setSwipe(false)
								setShowAddFileMenu(true)
							}}
						>
							{mediaCids.length > 0 && <Text>{mediaCids.length}</Text>}
							<Icon name='plus' width={26 * scaleSize} height={26 * scaleSize} fill='#C7C8D8' />
						</TouchableOpacity>
						<View
							style={{
								flex: 1,
								paddingLeft: 9 * scaleSize,
								paddingRight: 4 * scaleSize,
								alignItems: 'center',
								flexDirection: 'row',
							}}
						>
							<Animated.View style={[{ right: aPaddingLeft, opacity: aOpacity }]}>
								<View style={[{ alignItems: 'center' }]}>
									<Icon
										pack='custom'
										name='bertyzzz'
										height={37 * scaleSize}
										width={37 * scaleSize}
									/>
								</View>
							</Animated.View>

							<Animated.View
								style={[
									border.radius.medium,
									padding.left.small,
									{
										justifyContent: 'center',
										backgroundColor: _isFocused ? '#E8E9FC99' : '#F7F8FF',
										marginRight: aMaxWidth,
										height: 42 * scaleSize,
										right: aFixLeft,
										marginLeft: 9 * scaleSize,
										zIndex: 100,
										elevation: 100,
										flex: 1,
									},
								]}
							>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<TextInput
										value={message}
										ref={inputRef}
										multiline
										editable={disabled ? false : true}
										onFocus={() => setFocus(true)}
										onBlur={() => setFocus(false)}
										onChange={({ nativeEvent }) => setMessage(nativeEvent.text)}
										autoCorrect
										style={[
											_isFocused && { color: color.blue } && _styles.focusTextInput,
											text.bold.small,
											{
												fontFamily: 'Open Sans',
												fontSize: 15 * scaleSize,
												flex: 1,
											},
										]}
										placeholder={placeholder}
										placeholderTextColor={_isFocused ? color.blue : '#AFB1C0'}
										returnKeyType={isTablet ? 'send' : 'default'}
										onSubmitEditing={() => isTablet && handlePressSend()}
									/>
								</View>
							</Animated.View>
							<Animated.View
								style={{ opacity: aOpacitySendButton, position: 'absolute', right: aFixSend }}
							>
								<TouchableOpacity
									style={[
										{
											alignItems: 'center',
											justifyContent: 'center',
											width: 36 * scaleSize,
											height: 36 * scaleSize,
											backgroundColor: sendEnabled ? color.blue : '#AFB1C0',
											borderRadius: 18,
										},
									]}
									disabled={!sendEnabled}
									onPress={handlePressSend}
								>
									<Icon
										name='paper-plane-outline'
										width={20 * scaleSize}
										height={20 * scaleSize}
										fill={color.white}
									/>
								</TouchableOpacity>
							</Animated.View>
							<Animated.View
								style={{
									opacity: aOpacity,
									flexDirection: 'row',
									paddingLeft: 15 * scaleSize,
									right: aFixMicro,
								}}
							>
								<TouchableOpacity
									style={[
										{
											alignItems: 'center',
											justifyContent: 'center',
											borderRadius: 100,
											backgroundColor: color.blue,
											width: 36 * scaleSize,
											height: 36 * scaleSize,
										},
									]}
									onPress={async () => {
										setActivateTab(TabItems.Camera)
										try {
											const status = await check(
												Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
											)
											if (status !== RESULTS.GRANTED) {
												try {
													const status = await request(
														Platform.OS === 'ios'
															? PERMISSIONS.IOS.CAMERA
															: PERMISSIONS.ANDROID.CAMERA,
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
									}}
								>
									<Icon
										name='camera'
										pack='custom'
										height={16 * scaleSize}
										width={16 * scaleSize}
										fill={color.white}
									/>
								</TouchableOpacity>
							</Animated.View>
						</View>
					</View>
				</RecordComponent>
			</SafeAreaView>
		</BlurView>
	)
}

//
// DateChat
//

// Types
type ChatDateProps = {
	date: number
}

// Styles
const useStylesChatDate = () => {
	const [{ padding, text }] = useStyles()
	return {
		date: [padding.horizontal.scale(8), padding.vertical.scale(2)],
		dateText: [text.size.small, text.align.center],
	}
}

export const ChatDate: React.FC<ChatDateProps> = ({ date }) => {
	const _styles = useStylesChatDate()
	const [{ border, row }] = useStyles()
	const backgroundColor = '#F7F8FF'
	const textColor = '#AFB1C0'
	return (
		<View style={[row.item.justify, border.radius.medium, _styles.date, { backgroundColor }]}>
			<Text style={[_styles.dateText, { color: textColor }]}>{timeFormat.fmtTimestamp2(date)}</Text>
		</View>
	)
}

export const updateStickyDate: (
	setStickyDate: (date: number) => void,
) => (info: { viewableItems: ViewToken[] }) => void = (setStickyDate: (date: number) => void) => ({
	viewableItems,
}) => {
	if (viewableItems && viewableItems.length) {
		const minDate = viewableItems[viewableItems.length - 1]?.section?.title
		if (minDate) {
			setStickyDate(moment(minDate, 'DD/MM/YYYY').unix() * 1000)
		}
	}
}
