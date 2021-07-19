import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	TouchableOpacity,
	SafeAreaView,
	View,
	TextInput,
	NativeModules,
	ViewToken,
	Animated,
	Easing,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Text } from '@ui-kitten/components'
import { BlurView } from '@react-native-community/blur'
import moment from 'moment'
import ImagePicker from 'react-native-image-crop-picker'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useClient, useMsgrContext, useContact } from '@berty-tech/store/hooks'
import { checkPermissions, getMediaTypeFromMedias } from '@berty-tech/components/utils'

import { AddFileMenu } from './file-uploads/AddFileMenu'
import { timeFormat } from '../helpers'
import { TabItems } from './file-uploads/types'
import { SecurityAccess } from './file-uploads/SecurityAccess'
import { RecordComponent } from './record/RecordComponent'
import { useReplyReaction } from './ReplyReactionContext'
import { RESULTS } from 'react-native-permissions'

const {
	PlatformConstants: { interfaceIdiom: deviceType },
} = NativeModules

const isTablet = deviceType === 'pad'

//
// ChatFooter => Textinput for type message
//

const aDuration = 200

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

const ReplyMessageBar: React.FC<{ activeReplyInte: any; maxWidth: number; contact: any }> = ({
	activeReplyInte,
	maxWidth,
	contact,
}) => {
	const [{ border }] = useStyles()
	const { t }: { t: any } = useTranslation()
	return (
		<Animated.View
			style={[
				border.radius.top.medium,
				{
					backgroundColor: activeReplyInte?.backgroundColor,
					paddingVertical: 4,
					paddingHorizontal: 10,
					zIndex: 0,
				},
			]}
		>
			<View
				style={{
					position: 'absolute',
					top: -20,
					alignSelf: 'center',
					backgroundColor: '#F7F8FF',
					borderColor: '#E4E5EF',
					paddingVertical: 2,
					paddingHorizontal: 20,
					borderWidth: 1,
					borderRadius: 20,
				}}
			>
				<Text numberOfLines={1} style={{ color: '#6A81F2', fontSize: 10 }}>
					{t('chat.reply.replying-to')} {contact?.displayName || ''}
				</Text>
			</View>

			{activeReplyInte?.payload?.body ? (
				<Text
					numberOfLines={1}
					style={{
						width: maxWidth,
						color: activeReplyInte?.textColor,
						fontSize: 12,
						lineHeight: 17,
					}}
				>
					{activeReplyInte?.payload?.body}
				</Text>
			) : (
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
					}}
				>
					<Icon
						name='attach-outline'
						height={15}
						width={15}
						fill={activeReplyInte?.textColor}
						style={{ marginTop: 4 }}
					/>
					<Text
						numberOfLines={1}
						style={{
							width: maxWidth,
							color: activeReplyInte?.textColor,
							fontSize: 12,
							lineHeight: 17,
							marginLeft: 10,
						}}
					>
						{t(`medias.${getMediaTypeFromMedias(activeReplyInte?.medias)}`)}
					</Text>
				</View>
			)}
		</Animated.View>
	)
}

export const ChatFooter: React.FC<{
	convPk: string
	disabled?: boolean
	placeholder: string
	setSwipe: (val: boolean) => void
}> = ({ convPk, disabled = false, placeholder, setSwipe }) => {
	const ctx = useMsgrContext()
	const client = useClient()

	const [message, setMessage] = useState('')
	const [inputHeight, setInputHeight] = useState<number>(35)
	const [showAddFileMenu, setShowAddFileMenu] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = inputRef?.current?.isFocused() || false
	const [{ padding, flex, border, color, text }, { scaleSize }] = useStyles()
	const { activeReplyInte, setActiveReplyInte } = useReplyReaction()
	const contact =
		useContact(activeReplyInte?.conversation?.contactPublicKey) || activeReplyInte?.member

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
					targetCid: activeReplyInte?.cid,
				})
				.then(() => {
					setMessage('')
					setInputHeight(35)
					setMediaCids([])
					ctx.playSound('messageSent')
					setActiveReplyInte()
				})
				.catch((e) => {
					console.warn('e sending message:', e)
				})
		},
		[buf, convPk, ctx, activeReplyInte?.cid, setActiveReplyInte],
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
	const aFixMicro = createAnimationInterpolation(_aFixMicro, [0 * scaleSize, -120 * scaleSize])
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
		if (message.length > 0) {
			keyboardWillShow()
		} else {
			keyboardWillHide()
		}
	}, [message, keyboardWillHide, keyboardWillShow])

	useEffect(() => {
		if (activeReplyInte) {
			inputRef?.current?.focus()
		}
	}, [activeReplyInte])

	if (!conversation) {
		return null
	}

	return (
		<SafeAreaView
			style={[
				{
					zIndex: 10,
					minHeight: 80 * scaleSize,
				},
			]}
		>
			<BlurView
				overlayColor=''
				blurType='light'
				blurAmount={32}
				style={{
					position: 'absolute',
					right: 0,
					left: 0,
					bottom: 0,
					top: 0,
				}}
			/>
			{showAddFileMenu && <AddFileMenu onClose={handleCloseFileMenu} />}
			{isSecurityAccessVisible && (
				<SecurityAccess activeTab={activateTab} close={() => setSecurityAccessVisibility(false)} />
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
						padding.left.small,
						!_isFocused && padding.right.small,
						{
							alignItems: _isFocused && inputHeight > 35 ? 'flex-end' : 'center',
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
							alignItems: _isFocused && inputHeight > 35 ? 'flex-end' : 'center',
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
								{
									backgroundColor: _isFocused ? '#E8E9FC99' : '#F7F8FF',
									marginRight: aMaxWidth,
									right: aFixLeft,
									marginLeft: 9 * scaleSize,
									zIndex: 100,
									elevation: 100,
									flex: 1,
								},
							]}
						>
							{!!activeReplyInte && (
								<ReplyMessageBar
									activeReplyInte={activeReplyInte}
									contact={contact}
									maxWidth={aMaxWidth?.value}
								/>
							)}
							<View
								style={[
									(message.length > 0 || _isFocused) && { color: '#3443D9' },
									text.bold.small,
									padding.left.small,
									{
										paddingVertical: 5 * scaleSize,
									},
								]}
							>
								<TextInput
									value={message}
									ref={inputRef}
									multiline
									editable={disabled ? false : true}
									onBlur={() => {
										activeReplyInte && setActiveReplyInte()
									}}
									onChange={({ nativeEvent }) => setMessage(nativeEvent.text)}
									onContentSizeChange={({ nativeEvent }) =>
										setInputHeight(
											nativeEvent?.contentSize.height > 80 ? 80 : nativeEvent?.contentSize.height,
										)
									}
									autoCorrect
									style={[
										_isFocused ? { color: '#3443D9' } : { maxHeight: 35 * scaleSize },
										text.bold.small,
										{
											height: inputHeight < 35 ? 35 * scaleSize : inputHeight * scaleSize,
											fontFamily: 'Open Sans',
											paddingRight: 12 * scaleSize,
										},
									]}
									placeholder={placeholder}
									placeholderTextColor={_isFocused ? '#3443D9' : '#AFB1C0'}
									returnKeyType={isTablet ? 'send' : 'default'}
									onSubmitEditing={() => isTablet && handlePressSend()}
								/>
							</View>
						</Animated.View>
						<Animated.View
							style={{
								opacity: aOpacitySendButton,
								position: 'absolute',
								right: aFixSend,
								padding: 8 * scaleSize,
							}}
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
									const permissionStatus = await checkPermissions('camera')
									if (permissionStatus !== RESULTS.GRANTED) {
										return
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
