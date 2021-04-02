import React, { useState } from 'react'
import { View, TouchableOpacity, Animated } from 'react-native'
import { SHA3 } from 'sha3'
import palette from 'google-palette'
import Color from 'color'
import { Text, Icon } from '@ui-kitten/components'
import Popover, { PopoverPlacement } from 'react-native-popover-view'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import beapi from '@berty-tech/api'
import { useLastConvInteraction, useContact, useMsgrContext } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { MemberAvatar } from '../../avatars'
import { HyperlinkUserMessage, TimestampStatusUserMessage } from './UserMessageComponents'
import { pbDateToNum } from '../../helpers'
import { InteractionUserMessage, ParsedInteraction } from '@berty-tech/store/types.gen'
import { PictureMessage } from './PictureMessage'
import { AudioMessage } from './AudioMessage'
import { FileMessage } from './FileMessage'
import { useReplyReaction } from '../ReplyReactionContext'
import PopoverView from './Popover'
const pal = palette('tol-rainbow', 256)

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

const interactionsFilter = (inte: any) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage && inte.isMine

const getUserMessageState = (
	inte: any,
	members: { [key: string]: any } | undefined,
	convKind: any,
	previousMessage: any,
	nextMessage: any,
	border: any,
	color: any,
) => {
	const sentDate = pbDateToNum(inte?.sentDate)

	let name = ''
	let baseColor = color.blue
	let isFollowupMessage: boolean | undefined = false
	let isFollowedMessage: boolean | undefined = false
	let isWithinCollapseDuration: number | boolean | null | undefined = false
	let msgTextColor, msgBackgroundColor, msgBorderColor, msgSenderColor

	const cmd = null /*messenger.message.isCommandMessage(payload.body)*/
	if (convKind === beapi.messenger.Conversation.Type.ContactType) {
		// State of OneToOne conversation
		msgTextColor = inte.isMine
			? inte.acknowledged
				? color.white
				: cmd
				? color.grey
				: color.blue
			: color.blue
		msgBackgroundColor = inte.isMine ? (inte.acknowledged ? color.blue : color.white) : '#E2E4FF'
		msgBorderColor = inte.isMine && (cmd ? border.color.grey : border.color.blue)

		isWithinCollapseDuration =
			nextMessage &&
			inte.isMine === nextMessage?.isMine &&
			sentDate &&
			nextMessage.sentDate &&
			(parseInt(nextMessage?.sentDate.toString(), 10) || 0) - (sentDate || 0) < 60000 // one minute
	} else {
		// State for MultiMember conversation
		if (inte.memberPublicKey && members && members[inte.memberPublicKey]) {
			name = members[inte.memberPublicKey].displayName
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
				? color.white
				: cmd
				? color.grey
				: baseColor
			: baseColor
		msgBackgroundColor = inte.isMine
			? inte.acknowledged
				? baseColor
				: color.white
			: Color(baseColor).lighten(0.55).string()
		msgBorderColor = inte.isMine && (cmd ? border.color.grey : { borderColor: baseColor })
		msgSenderColor = inte.isMine ? 'red' : baseColor
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
	members?: { [key: string]: any }
	convPK: string
	convKind: any
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}> = ({ inte, members, convPK, convKind, previousMessage, nextMessage, replyOf, scrollToCid }) => {
	const isGroup = convKind === beapi.messenger.Conversation.Type.MultiMemberType
	const lastInte = useLastConvInteraction(convPK, interactionsFilter)
	const repliedTo =
		useContact(isGroup ? replyOf?.memberPublicKey : replyOf?.conversation?.contactPublicKey) ||
		replyOf?.member

	const _styles = useStylesMessage()
	const ctx = useMsgrContext()
	const [{ row, margin, padding, column, text, border, color }, { scaleSize }] = useStyles()
	const [animatedValue] = useState(new Animated.Value(0))

	const {
		activePopoverCid,
		setActivePopoverCid,
		setActiveReplyInte,
		setActiveEmojiKeyboardCid,
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
	} = getUserMessageState(inte, members, convKind, previousMessage, nextMessage, border, color)

	let repliedToColors =
		repliedTo &&
		getUserMessageState(replyOf, members, convKind, undefined, undefined, border, color)

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
						paddingRight: 5 * scaleSize,
						paddingBottom: 5 * scaleSize,
						justifyContent: 'center',
						alignItems: 'center',
						alignSelf: 'flex-end',
					}}
				>
					<MemberAvatar
						publicKey={inte.memberPublicKey}
						conversationPublicKey={inte.conversationPublicKey}
						size={30 * scaleSize}
					/>
				</View>
			)}

			<View
				style={[
					column.top,
					_styles.messageItem,
					{
						flexDirection: 'row',
					},
				]}
			>
				<View
					style={{
						alignItems: inte?.isMine ? 'flex-end' : 'flex-start',
					}}
				>
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
								isFollowedMessage && { marginLeft: 35 * scaleSize },
							]}
						>
							<View
								style={{
									backgroundColor: '#F7F8FF',
									borderColor: '#E4E5EF',
									paddingVertical: 1.5,
									paddingHorizontal: 20,
									borderWidth: 1,
									borderRadius: 20,
									marginBottom: -5,
									zIndex: 2,
								}}
							>
								<Text numberOfLines={1} style={{ color: '#6A81F2', fontSize: 10 }}>
									Replied to {repliedTo?.displayName || ''}
								</Text>
							</View>

							<TouchableOpacity
								onPress={() => scrollToCid(replyOf?.cid)}
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
									{replyOf?.payload?.body}
								</Text>
							</TouchableOpacity>
						</View>
					)}
					{(inte.medias?.length || 0) > 0 && (
						<View
							style={[
								isFollowedMessage && margin.left.scale(40),
								previousMessage?.medias?.[0]?.mimeType ? margin.top.tiny : margin.top.small,
								nextMessage?.medias?.[0]?.mimeType ? margin.bottom.tiny : margin.bottom.small,
							]}
						>
							{(() => {
								if (inte?.medias?.[0]?.mimeType?.startsWith('image')) {
									return <PictureMessage medias={inte.medias} />
								} else if (inte?.medias?.[0]?.mimeType?.startsWith('audio')) {
									return <AudioMessage medias={inte.medias} />
								} else {
									return <FileMessage medias={inte.medias} />
								}
							})()}
						</View>
					)}

					{!!inte.payload.body && (
						<PanGestureHandler
							enabled={!inte.isMine}
							onGestureEvent={({ nativeEvent }) => {
								if (nativeEvent.translationX > 0 && nativeEvent.translationX < 100) {
									Animated.timing(animatedValue, {
										toValue: nativeEvent.translationX,
										duration: 10,
										useNativeDriver: false,
									}).start()
								} else if (nativeEvent.translationX <= 0) {
									Animated.timing(animatedValue, {
										toValue: 0,
										duration: 100,
										useNativeDriver: false,
									}).start()
								}
							}}
							onHandlerStateChange={(event) => {
								if (event.nativeEvent.oldState === State.ACTIVE) {
									if (event.nativeEvent.velocityX > 100 || event.nativeEvent.translationX > 40) {
										Animated.timing(animatedValue, {
											toValue: 100,
											duration: 100,

											useNativeDriver: false,
										}).start()
									} else {
										Animated.timing(animatedValue, {
											toValue: 0,
											duration: 100,

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
									marginLeft: animatedValue,
								}}
							>
								<Animated.View
									style={{
										marginRight: 10,
										opacity: animatedValue.interpolate({
											inputRange: [0, 100],
											outputRange: [0, 1],
										}),
										position: 'absolute',
										bottom: 0,
										left: -50,
									}}
								>
									<Icon
										name='undo'
										height={40}
										width={40}
										fill='#D1D4DF'
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
									placement={PopoverPlacement.BOTTOM}
									isVisible={activePopoverCid === inte.cid}
									popoverStyle={{
										backgroundColor: 'transparent',
										borderWidth: 0,
										shadowColor: 'transparent',
										marginTop: -30,
										marginLeft: -20,
									}}
									backgroundStyle={{
										backgroundColor: 'transparent',
									}}
									arrowStyle={{
										backgroundColor: 'transparent',
									}}
									onRequestClose={() => {
										setActivePopoverCid(null)
									}}
									from={
										<TouchableOpacity
											disabled={inte.isMine}
											activeOpacity={0.9}
											onPress={() => {
												Animated.timing(animatedValue, {
													toValue: 0,
													duration: 100,
													useNativeDriver: false,
												}).start(() => {
													if (activePopoverCid === inte.cid) {
														setActivePopoverCid(null)
													} else {
														setActivePopoverCid(inte.cid)
													}
												})
											}}
										>
											<HyperlinkUserMessage
												inte={inte}
												msgBorderColor={msgBorderColor}
												isFollowedMessage={isFollowedMessage}
												msgBackgroundColor={msgBackgroundColor}
												msgTextColor={msgTextColor}
											/>
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
										}}
										onSelectEmoji={(emoji) => {
											ctx.client
												?.interact({
													conversationPublicKey: convPK,
													type: beapi.messenger.AppMessage.Type.TypeUserReaction,
													payload: beapi.messenger.AppMessage.UserReaction.encode({
														emoji: emoji,
														state: true,
													}).finish(),
													targetCid: inte?.cid,
												})
												.then(() => {
													ctx.playSound('messageSent')
													setActivePopoverCid(null)
													setActiveEmojiKeyboardCid(null)
												})
												.catch((e) => {
													console.warn('e sending message:', e)
												})
										}}
									/>
								</Popover>
							</Animated.View>
						</PanGestureHandler>
					)}

					{activePopoverCid === inte.cid && <Popover />}
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
