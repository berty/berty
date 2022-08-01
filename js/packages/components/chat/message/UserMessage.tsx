import { Icon } from '@ui-kitten/components'
import React, { useCallback, useState } from 'react'
import { View, Animated } from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import {
	useAppDispatch,
	useAppSelector,
	useInteractionAuthor,
	useLastConvInteraction,
	useMessengerClient,
	usePlaySound,
	useThemeColor,
} from '@berty/hooks'
import { setActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'
import { selectInteraction } from '@berty/redux/reducers/messenger.reducer'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

import { getUserMessageState } from './getUserMessageState'
import { Reactions } from './reactions/Reactions'
import { TimestampStatusUserMessage } from './UserMessageComponents'
import { UserMessageContent } from './UserMessageContent'
import { UserMessageRepliedTo } from './UserMessageRepliedTo'
import { UserMessageWrapper } from './UserMessageWrapper'

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage && inte.isMine

interface UserMessageProps {
	inte: InteractionUserMessage
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	convPK: string
	convKind: beapi.messenger.Conversation.Type
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}

export const UserMessage: React.FC<UserMessageProps> = ({
	inte,
	members,
	convPK,
	convKind,
	previousMessage,
	nextMessage,
	scrollToCid,
}) => {
	const isGroup = convKind === beapi.messenger.Conversation.Type.MultiMemberType
	const lastInte = useLastConvInteraction(convPK, interactionsFilter)
	const replyOf = useAppSelector(state =>
		selectInteraction(state, inte.conversationPublicKey || '', inte.targetCid || ''),
	)
	const repliedTo = useInteractionAuthor(replyOf?.conversationPublicKey || '', replyOf?.cid || '')
	const playSound = usePlaySound()
	const client = useMessengerClient()
	const { margin, text } = useStyles()
	const colors = useThemeColor()
	const [animatedValue] = useState(new Animated.Value(0))
	const [messageLayoutWidth, setMessageLayoutWidth] = useState(0)
	const dispatch = useAppDispatch()
	const [highlightCid, setHighlightCid] = useState<string | undefined | null>()
	const [isMenuVisible, setIsMenuVisible] = useState(false)
	const [isEmojiVisible, setIsEmojiVisible] = useState(false)

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

	const handleSelectEmoji = useCallback(
		(emoji: string, remove: boolean = false) => {
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
					playSound('messageSent')
				})
				.catch((e: unknown) => {
					console.warn('e sending message:', e)
				})
		},
		[client, convPK, playSound, inte?.cid],
	)

	return (
		<UserMessageWrapper
			inte={inte}
			members={members}
			convPK={convPK}
			convKind={convKind}
			previousMessage={previousMessage}
			nextMessage={nextMessage}
			replyOf={replyOf}
			isMenuVisible={isMenuVisible}
			setIsMenuVisible={setIsMenuVisible}
			isEmojiVisible={isEmojiVisible}
			setIsEmojiVisible={setIsEmojiVisible}
			isGroup={isGroup}
			handleSelectEmoji={handleSelectEmoji}
			isFollowedMessage={isFollowedMessage}
			msgTextColor={msgTextColor}
			msgBackgroundColor={msgBackgroundColor}
		>
			<View style={{ alignItems: inte?.isMine ? 'flex-end' : 'flex-start' }}>
				{!inte.isMine && isGroup && !isFollowupMessage && (
					<View style={[isFollowedMessage && margin.left.scale(40)]}>
						<UnifiedText
							style={[text.bold, margin.bottom.tiny, text.size.tiny, { color: msgSenderColor }]}
						>
							{name}
						</UnifiedText>
					</View>
				)}

				{!!repliedTo && (
					<UserMessageRepliedTo
						inte={inte}
						members={members}
						scrollToCid={scrollToCid}
						convKind={convKind}
						replyOf={replyOf}
						isFollowedMessage={isFollowedMessage}
						setHighlightCid={setHighlightCid}
						repliedTo={repliedTo}
					/>
				)}

				<View style={{ alignItems: inte.isMine ? 'flex-end' : 'flex-start' }}>
					<PanGestureHandler
						enabled={!inte.isMine}
						activeOffsetX={20}
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
									dispatch(
										setActiveReplyInteraction({
											convPK,
											activeReplyInteraction: {
												...inte,
												backgroundColor: msgBackgroundColor,
												textColor: msgTextColor,
											},
										}),
									)
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
										dispatch(
											setActiveReplyInteraction({
												convPK,
												activeReplyInteraction: {
													...inte,
													backgroundColor: msgBackgroundColor,
													textColor: msgTextColor,
												},
											}),
										)
									}}
								/>
							</Animated.View>
							<UserMessageContent
								inte={inte}
								setMessageLayoutWidth={setMessageLayoutWidth}
								setIsMenuVisible={setIsMenuVisible}
								highlightCid={highlightCid}
								isFollowedMessage={isFollowedMessage}
								previousMessage={previousMessage}
								nextMessage={nextMessage}
								msgBorderColor={msgBorderColor || undefined}
								msgBackgroundColor={msgBackgroundColor}
								msgTextColor={msgTextColor}
							/>
						</Animated.View>
					</PanGestureHandler>
					{!!messageLayoutWidth && (
						<Reactions
							convPk={convPK}
							cid={inte.cid!}
							onEmojiKeyboard={() => setIsEmojiVisible(true)}
							onPressEmoji={handleSelectEmoji}
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
		</UserMessageWrapper>
	)
}
