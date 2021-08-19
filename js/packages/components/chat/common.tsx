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
	Dimensions,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Text } from '@ui-kitten/components'
import moment from 'moment'
import ImagePicker from 'react-native-image-crop-picker'

import { useStyles } from '@berty-tech/styles'
import beapi from '@berty-tech/api'
import { useClient, useMsgrContext, useContact, useThemeColor } from '@berty-tech/store/hooks'
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

const { width } = Dimensions.get('window')
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
	const colors = useThemeColor()
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
					backgroundColor: colors['input-background'],
					borderColor: colors['positive-asset'],
					paddingVertical: 2,
					paddingHorizontal: 20,
					borderWidth: 1,
					borderRadius: 20,
				}}
			>
				<Text numberOfLines={1} style={{ color: colors['background-header'], fontSize: 10 }}>
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
	const [isRecording, setRecording] = useState(false)
	const [inputHeight, setInputHeight] = useState<number>(35)
	const [showAddFileMenu, setShowAddFileMenu] = useState(false)
	const inputRef = useRef<TextInput>(null)
	const _isFocused = inputRef?.current?.isFocused() || false
	const [{ padding, flex, border, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
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
	const _aOpacitySendButton = useRef(new Animated.Value(0)).current

	//new changes
	const _addMediaOpacity = useRef(new Animated.Value(1)).current
	const _bertyzOpacity = useRef(new Animated.Value(1)).current
	const _cameraOpacity = useRef(new Animated.Value(1)).current
	const _microOpacity = useRef(new Animated.Value(1)).current
	const _trashOpacity = useRef(new Animated.Value(1)).current
	const _microScale = useRef(new Animated.Value(0)).current
	const _trashScale = useRef(new Animated.Value(0)).current

	const _addTranslate = useRef(new Animated.Value(0.5)).current
	const _bertyzTranslate = useRef(new Animated.Value(0.5)).current
	const _cameraTranslate = useRef(new Animated.Value(0.5)).current
	const _microTranslate = useRef(new Animated.Value(0.5)).current
	const _trashTranslate = useRef(new Animated.Value(0)).current
	const _trashAnimationProgress = useRef(new Animated.Value(0)).current
	const _microBorderScale = useRef(new Animated.Value(0)).current

	const aMaxWidth = createAnimationInterpolation(_aMaxWidth, [0, -(94 * scaleSize)])
	const aFixLeft = createAnimationInterpolation(_aFixLeft, [0, 40 * scaleSize])
	const aFixMicro = createAnimationInterpolation(_aFixMicro, [0 * scaleSize, -120 * scaleSize])
	const aFixSend = createAnimationInterpolation(_aFixMicro, [50, -55 * scaleSize])
	const aPaddingLeft = createAnimationInterpolation(_aPaddingLeft, [0, 45])
	const aOpacitySendButton = createAnimationInterpolation(_aOpacitySendButton, [0, 1])

	//new changes
	const addMediaOpacity = createAnimationInterpolation(_addMediaOpacity, [0, 1])
	const bertyzOpacity = createAnimationInterpolation(_bertyzOpacity, [0, 1])
	const cameraOpacity = createAnimationInterpolation(_cameraOpacity, [0, 1])
	const microOpacity = createAnimationInterpolation(_microOpacity, [0, 1])
	const trashOpacity = createAnimationInterpolation(_trashOpacity, [0, 1])
	const microScale = createAnimationInterpolation(_microScale, [1, 2])
	const trashScale = createAnimationInterpolation(_trashScale, [1, 2])
	const microBorderScale = createAnimationInterpolation(_microBorderScale, [1, 3])

	const addTranslate = createAnimationInterpolation(_addTranslate, [
		-120 * scaleSize,
		120 * scaleSize,
	])

	const bertyzTranslate = createAnimationInterpolation(_bertyzTranslate, [
		-120 * scaleSize,
		120 * scaleSize,
	])
	const cameraTranslate = createAnimationInterpolation(_cameraTranslate, [
		-120 * scaleSize,
		120 * scaleSize,
	])
	const microTranslate = createAnimationInterpolation(_microTranslate, [-width, width])
	const trashTranslate = createAnimationInterpolation(_trashTranslate, [
		-240 * scaleSize,
		240 * scaleSize,
	])

	const keyboardWillShow = useCallback(
		(event?: any) => {
			const duration = event?.duration || aDuration
			Animated.parallel([
				createAnimationTiming(_aMaxWidth, 1, duration),
				createAnimationTiming(_aFixLeft, 1, duration),
				createAnimationTiming(_aFixMicro, 1, duration),
				createAnimationTiming(_aFixSend, 1, duration),
				createAnimationTiming(_aPaddingLeft, 1, duration),
				createAnimationTiming(_bertyzOpacity, 0, duration),
				createAnimationTiming(_cameraOpacity, 0, duration),
				createAnimationTiming(_microOpacity, 0, duration),
				createAnimationTiming(_addMediaOpacity, 0, duration),
				createAnimationTiming(_aOpacitySendButton, 1, duration),
			]).start()
		},
		[
			_aMaxWidth,
			_aFixLeft,
			_aPaddingLeft,
			_bertyzOpacity,
			_cameraOpacity,
			_microOpacity,
			_aFixMicro,
			_aOpacitySendButton,
			_aFixSend,
			_addMediaOpacity,
		],
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
				createAnimationTiming(_bertyzOpacity, 1, duration),
				createAnimationTiming(_cameraOpacity, 1, duration),
				createAnimationTiming(_microOpacity, 1, duration),
				createAnimationTiming(_addMediaOpacity, 1, duration),
				createAnimationTiming(_aOpacitySendButton, 0, duration),
			]).start()
		},
		[
			_aMaxWidth,
			_aFixLeft,
			_aPaddingLeft,
			_bertyzOpacity,
			_cameraOpacity,
			_microOpacity,
			_aFixMicro,
			_aOpacitySendButton,
			_aFixSend,
			_addMediaOpacity,
		],
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
					minHeight:
						inputHeight > 45 * scaleSize
							? 80 * scaleSize + inputHeight * scaleSize
							: 80 * scaleSize,
					justifyContent: 'center',
					backgroundColor: colors['main-background'],
				},
			]}
		>
			{showAddFileMenu && <AddFileMenu onClose={handleCloseFileMenu} />}
			{isSecurityAccessVisible && (
				<SecurityAccess activeTab={activateTab} close={() => setSecurityAccessVisibility(false)} />
			)}
			<RecordComponent
				onStartRecording={() => {
					setRecording(true)
					const duration = aDuration
					Animated.parallel([
						createAnimationTiming(_cameraOpacity, 0, duration),
						createAnimationTiming(_bertyzOpacity, 0, duration),
						createAnimationTiming(_addMediaOpacity, 0, duration),
						createAnimationTiming(_addTranslate, 0, duration),
						createAnimationTiming(_bertyzTranslate, 0, duration),
						createAnimationTiming(_cameraTranslate, 0, duration),
						createAnimationTiming(_microScale, 1, duration),
						createAnimationTiming(_microTranslate, 0.49, duration),
						createAnimationTiming(_trashOpacity, 1, duration),
						createAnimationTiming(_trashTranslate, 0.5, duration),
					]).start(() => {
						Animated.parallel([
							createAnimationTiming(_addTranslate, 1, duration),
							createAnimationTiming(_bertyzTranslate, 1, duration),
						]).start()
					})
				}}
				onStopRecording={() => {
					setRecording(false)
					const duration = aDuration
					Animated.parallel([
						createAnimationTiming(_cameraOpacity, 1, duration),
						createAnimationTiming(_bertyzOpacity, 1, duration),
						createAnimationTiming(_addMediaOpacity, 1, duration),
						createAnimationTiming(_addTranslate, 0.5, duration),
						createAnimationTiming(_bertyzTranslate, 0.5, duration),
						createAnimationTiming(_cameraTranslate, 0.5, duration),
						createAnimationTiming(_microScale, 0, duration),
						createAnimationTiming(_microTranslate, 0.5, duration),
						createAnimationTiming(_trashOpacity, 0, duration),
						createAnimationTiming(_trashTranslate, 1, duration),
					]).start(() => {
						Animated.parallel([createAnimationTiming(_trashTranslate, 0, 1)]).start()
					})
				}}
				onDeleteRecording={(callback) => {
					const duration = aDuration
					Animated.parallel([
						createAnimationTiming(_microScale, 0, duration),
						createAnimationTiming(_microTranslate, 0.15, duration),
						createAnimationTiming(_trashTranslate, 0.55, duration),
						createAnimationTiming(_trashScale, 0.7, duration),
						Animated.timing(_trashAnimationProgress, {
							toValue: 1,
							duration: duration * 2,
							useNativeDriver: true,
							easing: Easing.linear,
						}),
					]).start(() => {
						Animated.parallel([
							createAnimationTiming(_microTranslate, 0.3, duration),
							createAnimationTiming(_trashTranslate, 0.5, duration),
							createAnimationTiming(_trashScale, 0, duration),
							Animated.timing(_trashAnimationProgress, {
								toValue: 0,
								duration: 1,
								useNativeDriver: true,
								easing: Easing.linear,
							}),
						]).start(() => callback?.())
					})
				}}
				aFixMicro={aFixMicro}
				microOpacity={microOpacity}
				microScale={microScale}
				microTranslate={microTranslate}
				convPk={convPk}
				disableLockMode={false}
				trashOpacity={trashOpacity}
				trashTranslate={trashTranslate}
				trashScale={trashScale}
				trashAnimationProgress={_trashAnimationProgress}
				microBorderScale={microBorderScale}
			>
				<View
					style={[
						flex.tiny,
						border.radius.medium,
						padding.left.small,
						padding.right.small,
						{
							alignItems: 'center',
							flexDirection: 'row',
						},
					]}
				>
					<Animated.View
						style={{
							opacity: addMediaOpacity,
							transform: [
								{
									translateX: addTranslate,
								},
							],
						}}
					>
						<TouchableOpacity
							style={[
								{
									backgroundColor: colors['input-background'],
									zIndex: 3,
									elevation: 3,
									width: 37 * scaleSize,
									height: 37 * scaleSize,
									justifyContent: 'center',
									alignItems: 'center',
								},
								padding.small,
								border.radius.big,
							]}
							onPress={() => {
								setSwipe(false)
								setShowAddFileMenu(true)
							}}
						>
							{mediaCids.length > 0 && <Text>{mediaCids.length}</Text>}
							<Icon name='plus' width={26 * scaleSize} height={26 * scaleSize} fill='#525BEC' />
						</TouchableOpacity>
					</Animated.View>
					<View
						style={{
							flex: 1,
							paddingLeft: 9 * scaleSize,
							paddingRight: 4 * scaleSize,
							alignItems: 'center',
							flexDirection: 'row',
						}}
					>
						<Animated.View
							style={[
								{
									right: aPaddingLeft,
									opacity: bertyzOpacity,
									transform: [
										{
											translateX: bertyzTranslate,
										},
									],
								},
							]}
						>
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
									backgroundColor: _isFocused
										? `${colors['positive-asset']}70`
										: colors['input-background'],
									marginRight: aMaxWidth,
									right: aFixLeft,
									marginLeft: 9 * scaleSize,
									zIndex: 100,
									elevation: 100,
									flex: 1,
									textAlign: 'center',
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
									(message.length > 0 || _isFocused) && { color: colors['background-header'] },
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
									editable={disabled || isRecording ? false : true}
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
										_isFocused && { color: colors['background-header'] },
										text.bold.small,
										// text.align.center,
										{
											height: inputHeight < 35 ? 35 * scaleSize : inputHeight * scaleSize,
											fontFamily: 'Open Sans',
											paddingRight: 12 * scaleSize,
										},
									]}
									placeholder={isRecording ? '' : placeholder}
									placeholderTextColor={
										!_isFocused ? colors['secondary-text'] : colors['background-header']
									}
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
										backgroundColor: sendEnabled
											? colors['background-header']
											: colors['secondary-text'],
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
									fill={colors['reverted-main-text']}
								/>
							</TouchableOpacity>
						</Animated.View>
						<Animated.View
							style={{
								opacity: cameraOpacity,
								flexDirection: 'row',
								paddingLeft: 15 * scaleSize,
								right: aFixMicro,
								transform: [
									{
										translateX: cameraTranslate,
									},
								],
							}}
						>
							<TouchableOpacity
								style={[
									{
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: 100,
										backgroundColor: colors['background-header'],
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
									fill={colors['reverted-main-text']}
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
	const colors = useThemeColor()
	const backgroundColor = colors['input-background']
	const textColor = colors['secondary-text']
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
