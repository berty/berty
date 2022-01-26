import React, { useState } from 'react'
import { View, TouchableOpacity, Animated } from 'react-native'
import { SHA3 } from 'sha3'
import palette from 'google-palette'
import { Text, Icon } from '@ui-kitten/components'
import Popover from 'react-native-popover-view'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'

import beapi from '@berty-tech/api'
import {
	useMessengerContext,
	useThemeColor,
	InteractionUserMessage,
	ParsedInteraction,
	pbDateToNum,
	useMessengerClient,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import {
	useAppSelector,
	useInteractionAuthor,
	useLastConvInteraction,
} from '@berty-tech/react-redux'
import { selectInteraction } from '@berty-tech/redux/reducers/messenger.reducer'

import { MemberAvatar } from '../../avatars'
import { HyperlinkUserMessage, TimestampStatusUserMessage } from './UserMessageComponents'
import { PictureMessage } from './PictureMessage'
import { AudioMessage } from './AudioMessage'
import { FileMessage } from './FileMessage'
import { useReplyReaction } from '../ReplyReactionContext'
import PopoverView from './Popover'
import { getMediaTypeFromMedias } from '../../utils'
import { Reactions } from './Reactions'

const pal = palette('tol-rainbow', 256)
const AVATAR_SIZE = 30
const AVATAR_SPACE_RIGHT = 5

const useStylesMessage = () => {
	const [{ row, text, width }] = useStyles()
	return {
		isMeMessage: [row.item.bottom, { maxWidth: '90%' }],
		isOtherMessage: [row.item.top, { maxWidth: '90%' }],
		circleAvatarUserMessage: [row.item.bottom, width(40)],
		messageItem: [],
		personNameInGroup: text.size.tiny,
	}
}

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage && inte.isMine

const getUserMessageState = (
	inte: ParsedInteraction,
	members: { [key: string]: beapi.messenger.IMember | undefined } | undefined,
	convKind: any,
	previousMessage: ParsedInteraction | undefined,
	nextMessage: ParsedInteraction | undefined,
	colors: any,
) => {
	const sentDate = pbDateToNum(inte?.sentDate)

	let name = ''
	let baseColor = colors['background-header']
	let isFollowupMessage: boolean | undefined = false
	let isFollowedMessage: boolean | undefined = false
	let isWithinCollapseDuration: number | boolean | null | undefined = false
	let msgTextColor, msgBackgroundColor, msgBorderColor, msgSenderColor

	const cmd = null /*messenger.message.isCommandMessage(payload.body)*/
	if (convKind === beapi.messenger.Conversation.Type.ContactType) {
		// State of OneToOne conversation
		msgTextColor = inte.isMine
			? inte.acknowledged
				? colors['reverted-main-text']
				: cmd
				? colors['secondary-text']
				: colors['background-header']
			: colors['background-header']
		msgBackgroundColor = inte.isMine
			? inte.acknowledged
				? colors['background-header']
				: colors['reverted-main-text']
			: colors['input-background']
		msgBorderColor =
			inte.isMine &&
			(cmd
				? { borderColor: colors['secondary-text'] }
				: { borderColor: colors['background-header'] })

		isWithinCollapseDuration =
			nextMessage &&
			inte.isMine === nextMessage?.isMine &&
			sentDate &&
			nextMessage.sentDate &&
			(parseInt(nextMessage?.sentDate.toString(), 10) || 0) - (sentDate || 0) < 60000 // one minute
	} else {
		// State for MultiMember conversation
		if (inte.memberPublicKey && members && members[inte.memberPublicKey]) {
			name = members[inte.memberPublicKey]?.displayName || ''
		}
		isFollowupMessage =
			previousMessage && !inte.isMine && inte.memberPublicKey === previousMessage.memberPublicKey
		isFollowedMessage =
			nextMessage && !inte.isMine && inte.memberPublicKey === nextMessage.memberPublicKey

		isWithinCollapseDuration =
			nextMessage &&
			inte?.memberPublicKey === nextMessage?.memberPublicKey &&
			sentDate &&
			nextMessage.sentDate &&
			(parseInt(nextMessage?.sentDate.toString(), 10) || 0) - (sentDate || 0) < 60000 // one minute

		if (!inte.isMine && inte.memberPublicKey) {
			const h = new SHA3(256).update(inte.memberPublicKey).digest()
			baseColor = '#' + pal[h[0]]
		}
		msgTextColor = inte.isMine
			? inte.acknowledged
				? colors['reverted-main-text']
				: cmd
				? colors['secondary-text']
				: baseColor
			: colors['reverted-main-text']
		msgBackgroundColor = inte.isMine
			? inte.acknowledged
				? baseColor
				: colors['reverted-main-text']
			: baseColor
		msgBorderColor =
			inte.isMine && (cmd ? { borderColor: colors['secondary-text'] } : { borderColor: baseColor })
		msgSenderColor = inte.isMine ? colors['warning-asset'] : baseColor
	}

	return {
		name,
		isFollowupMessage,
		isFollowedMessage,
		isWithinCollapseDuration,
		msgTextColor,
		msgBackgroundColor,
		msgBorderColor,
		msgSenderColor,
		cmd,
	}
}

export const UserMessage: React.FC<{
	inte: InteractionUserMessage
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	convPK: string
	convKind: any
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}> = ({ inte, members, convPK, convKind, previousMessage, nextMessage, scrollToCid }) => {
	const isGroup = convKind === beapi.messenger.Conversation.Type.MultiMemberType
	const lastInte = useLastConvInteraction(convPK, interactionsFilter)
	const replyOf = useAppSelector(state =>
		selectInteraction(state, inte.conversationPublicKey || '', inte.targetCid || ''),
	)
	const repliedTo = useInteractionAuthor(replyOf?.conversationPublicKey || '', replyOf?.cid || '')
	const _styles = useStylesMessage()
	const ctx = useMessengerContext()
	const client = useMessengerClient()
	const [{ row, margin, padding, column, text, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [animatedValue] = useState(new Animated.Value(0))
	const [messageLayoutWidth, setMessageLayoutWidth] = useState(0)

	const {
		activePopoverCid,
		setActivePopoverCid,
		setActiveReplyInte,
		setActiveEmojiKeyboardCid,
		highlightCid,
		setHighlightCid,
		setIsActivePopoverOnKeyboardClose,
	} = useReplyReaction()

	const {
		name,
		isFollowupMessage,
		isFollowedMessage,
		isWithinCollapseDuration,
		msgTextColor,
		msgBackgroundColor,
		msgBorderColor,
		msgSenderColor,
		cmd,
	} = getUserMessageState(inte, members, convKind, previousMessage, nextMessage, colors)

	let repliedToColors =
		repliedTo &&
		replyOf &&
		getUserMessageState(replyOf, members, convKind, undefined, undefined, colors)

	const togglePopover = () => {
		if (inte.isMine) {
			return
		}
		if (activePopoverCid === inte.cid) {
			setActivePopoverCid(null)
		} else if ((animatedValue as any)._value === 0) {
			setActivePopoverCid(inte.cid)
		}
		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 50,
			useNativeDriver: false,
		}).start(() => {})
	}

	const handleSelectEmoji = (emoji: string, remove: boolean = false) => {
		client
			?.interact({
				conversationPublicKey: convPK,
				type: beapi.messenger.AppMessage.Type.TypeUserReaction,
				payload: beapi.messenger.AppMessage.UserReaction.encode({
					emoji,
					state: !remove,
				}).finish(),
				targetCid: inte?.cid,
			})
			.then(() => {
				ctx.playSound('messageSent')
				setActivePopoverCid(null)
				setActiveEmojiKeyboardCid(null)
			})
			.catch((e: unknown) => {
				console.warn('e sending message:', e)
			})
	}

	const isHighlight = highlightCid === inte.cid

	return (
		<View
			style={[
				row.left,
				inte.isMine ? _styles.isMeMessage : _styles.isOtherMessage,
				padding.horizontal.medium,
				padding.top.scale(2),
			]}
		>
			{!inte.isMine && isGroup && !isFollowedMessage && (
				<View
					style={{
						paddingRight: AVATAR_SPACE_RIGHT * scaleSize,
						paddingBottom: 5 * scaleSize,
						justifyContent: 'center',
						alignItems: 'center',
						alignSelf: 'flex-end',
					}}
				>
					<MemberAvatar
						publicKey={inte.memberPublicKey}
						conversationPublicKey={inte.conversationPublicKey}
						size={AVATAR_SIZE * scaleSize}
						pressable
					/>
				</View>
			)}

			<View style={[column.top, _styles.messageItem, { flexDirection: 'row' }]}>
				<View style={{ alignItems: inte?.isMine ? 'flex-end' : 'flex-start' }}>
					{!inte.isMine && isGroup && !isFollowupMessage && (
						<View style={[isFollowedMessage && margin.left.scale(40)]}>
							<Text
								style={[
									text.bold.medium,
									margin.bottom.tiny,
									_styles.personNameInGroup,
									{ color: msgSenderColor },
								]}
							>
								{name}
							</Text>
						</View>
					)}

					{!!repliedTo && (
						<View
							style={[
								{
									alignSelf: inte?.isMine ? 'flex-end' : 'flex-start',
									alignItems: inte?.isMine ? 'flex-end' : 'flex-start',
									marginTop: 7,
								},
								isFollowedMessage && { marginLeft: (AVATAR_SIZE + AVATAR_SPACE_RIGHT) * scaleSize },
							]}
						>
							<View
								style={{
									backgroundColor: colors['input-background'],
									borderColor: colors['negative-asset'],
									paddingVertical: 1.5,
									paddingHorizontal: 20,
									borderWidth: 1,
									borderRadius: 20,
									marginBottom: -5,
									zIndex: 2,
								}}
							>
								<Text
									numberOfLines={1}
									style={{ color: colors['background-header'], fontSize: 10 }}
								>
									<>
										{t('chat.reply.replied-to')} {repliedTo?.displayName || ''}
									</>
								</Text>
							</View>

							<TouchableOpacity
								onPress={() => {
									if (!replyOf?.cid) {
										return
									}
									scrollToCid(replyOf.cid)
									setHighlightCid(replyOf.cid)
								}}
								style={[
									border.radius.top.medium,
									inte.isMine ? border.radius.left.medium : border.radius.right.medium,
									{
										backgroundColor: repliedToColors?.msgBackgroundColor,
										marginBottom: -15,
										padding: 10,
										paddingBottom: 20,
									},
								]}
							>
								<Text
									numberOfLines={1}
									style={{ color: repliedToColors?.msgTextColor, fontSize: 10, lineHeight: 17 }}
								>
									{(replyOf?.type === beapi.messenger.AppMessage.Type.TypeUserMessage &&
										replyOf?.payload?.body) ||
										`${t('chat.reply.response-to')} ${t(
											`medias.${getMediaTypeFromMedias(replyOf?.medias)}`,
										)}`}
								</Text>
							</TouchableOpacity>
						</View>
					)}

					<View style={{ position: 'relative' }}>
						<PanGestureHandler
							enabled={!inte.isMine}
							onGestureEvent={({ nativeEvent }) => {
								if (nativeEvent.translationX > 0 && nativeEvent.translationX < 120) {
									Animated.timing(animatedValue, {
										toValue: nativeEvent.translationX,
										duration: 1,
										useNativeDriver: false,
									}).start()
								} else if (nativeEvent.translationX <= 0) {
									Animated.timing(animatedValue, {
										toValue: 0,
										duration: 50,
										useNativeDriver: false,
									}).start()
								}
							}}
							onHandlerStateChange={event => {
								if (event.nativeEvent.oldState === State.ACTIVE) {
									if (event.nativeEvent.translationX > 120) {
										setActiveReplyInte({
											...inte,
											backgroundColor: msgBackgroundColor,
											textColor: msgTextColor,
										})
										Animated.timing(animatedValue, {
											toValue: 0,
											duration: 50,
											useNativeDriver: false,
										}).start()
									} else if (
										event.nativeEvent.velocityX > 100 ||
										event.nativeEvent.translationX > 40
									) {
										Animated.timing(animatedValue, {
											toValue: 60,
											duration: 50,

											useNativeDriver: false,
										}).start()
									} else {
										Animated.timing(animatedValue, {
											toValue: 0,
											duration: 50,

											useNativeDriver: false,
										}).start()
									}
								}
							}}
						>
							<Animated.View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									transform: [{ translateX: animatedValue }],
								}}
							>
								<Animated.View
									style={{
										marginRight: 10,
										opacity: animatedValue.interpolate({
											inputRange: [0, 60],
											outputRange: [0, 1],
										}),
										position: 'absolute',
										left: -50,
									}}
								>
									<Icon
										name='undo'
										height={30}
										width={30}
										fill={colors['negative-asset']}
										onPress={() => {
											setActiveReplyInte({
												...inte,
												backgroundColor: msgBackgroundColor,
												textColor: msgTextColor,
											})
											setActivePopoverCid(null)
											Animated.timing(animatedValue, {
												toValue: 0,
												duration: 100,
												useNativeDriver: false,
											}).start()
										}}
									/>
								</Animated.View>
								<Popover
									isVisible={activePopoverCid === inte.cid}
									popoverStyle={{
										backgroundColor: 'transparent',
										borderWidth: 0,
										shadowColor: 'transparent',
									}}
									backgroundStyle={{ backgroundColor: 'transparent' }}
									arrowStyle={{ backgroundColor: 'transparent' }}
									onRequestClose={() => {
										setActivePopoverCid(null)
									}}
									from={
										<TouchableOpacity
											onLayout={event => {
												setMessageLayoutWidth(event.nativeEvent.layout.width)
											}}
											disabled={inte.isMine}
											activeOpacity={0.9}
											onLongPress={togglePopover}
											style={{ marginBottom: inte?.reactions?.length ? 10 : 0 }}
										>
											<>
												{!!inte.medias?.length && (
													<View
														style={[
															isFollowedMessage && {
																marginLeft: (AVATAR_SIZE + AVATAR_SPACE_RIGHT) * scaleSize,
															},
															previousMessage?.medias?.[0]?.mimeType
																? margin.top.tiny
																: margin.top.small,
															nextMessage?.medias?.[0]?.mimeType
																? margin.bottom.tiny
																: margin.bottom.small,
														]}
													>
														{(() => {
															if (inte.medias[0]?.mimeType?.startsWith('image')) {
																return (
																	<PictureMessage
																		medias={inte.medias}
																		onLongPress={togglePopover}
																		isHighlight={isHighlight}
																	/>
																)
															} else if (inte.medias[0]?.mimeType?.startsWith('audio')) {
																return (
																	<AudioMessage
																		medias={inte.medias}
																		onLongPress={togglePopover}
																		isHighlight={isHighlight}
																		isMine={!!inte.isMine}
																	/>
																)
															} else {
																return (
																	<FileMessage
																		medias={inte.medias}
																		onLongPress={togglePopover}
																		isHighlight={isHighlight}
																	/>
																)
															}
														})()}
													</View>
												)}
												{!!(!inte.medias?.length || inte.payload?.body) && (
													<HyperlinkUserMessage
														inte={inte}
														msgBorderColor={msgBorderColor}
														isFollowedMessage={isFollowedMessage}
														msgBackgroundColor={msgBackgroundColor}
														msgTextColor={msgTextColor}
														isHighlight={isHighlight}
													/>
												)}
											</>
										</TouchableOpacity>
									}
								>
									<PopoverView
										onReply={() => {
											setActivePopoverCid(null)
											setTimeout(() => {
												setActiveReplyInte({
													...inte,
													backgroundColor: msgBackgroundColor,
													textColor: msgTextColor,
												})
											}, 500)
										}}
										onEmojiKeyboard={() => {
											setActivePopoverCid(null)
											setActiveEmojiKeyboardCid(inte.cid)
											setIsActivePopoverOnKeyboardClose(true)
										}}
										onSelectEmoji={handleSelectEmoji}
									/>
								</Popover>
							</Animated.View>
						</PanGestureHandler>

						{activePopoverCid === inte.cid && <Popover />}
						{!!inte?.reactions?.length && !!messageLayoutWidth && (
							<Reactions
								reactions={inte.reactions}
								onEmojiKeyboard={() => {
									setActivePopoverCid(null)
									setActiveEmojiKeyboardCid(inte.cid)
									setIsActivePopoverOnKeyboardClose(false)
								}}
								onRemoveEmoji={handleSelectEmoji}
							/>
						)}
					</View>
					{!isWithinCollapseDuration && (
						<TimestampStatusUserMessage
							inte={inte}
							lastInte={lastInte}
							isFollowedMessage={isFollowedMessage}
							cmd={cmd}
						/>
					)}
				</View>
			</View>
		</View>
	)
}
