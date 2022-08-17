import React, { useCallback, useState } from 'react'
import { View } from 'react-native'

import beapi from '@berty/api'
import { BottomModal } from '@berty/components/modals'
import {
	useAppSelector,
	useInteractionAuthor,
	useLastConvInteraction,
	useMessengerClient,
	usePlaySound,
	useThemeColor,
} from '@berty/hooks'
import { selectInteraction } from '@berty/redux/reducers/messenger.reducer'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

import { EmojiKeyboard } from '../../modals/EmojiKeyboard.modal'
import { MessageMenu } from '../../modals/MessageMenu.modal'
import { Reactions } from '../reactions/Reactions'
import { GestureHandler } from './GestureHandler'
import { getUserMessageState } from './getUserMessageState'
import { RepliedTo } from './RepliedTo'
import { SenderName } from './SenderName'
import { TimestampStatus } from './TimestampStatus'
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
	const colors = useThemeColor()
	const [messageLayoutWidth, setMessageLayoutWidth] = useState(0)
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
			convKind={convKind}
			previousMessage={previousMessage}
			nextMessage={nextMessage}
			replyOf={replyOf}
			isGroup={isGroup}
			isFollowedMessage={isFollowedMessage}
		>
			<View style={{ alignItems: inte?.isMine ? 'flex-end' : 'flex-start' }}>
				{!inte.isMine && isGroup && !isFollowupMessage && (
					<SenderName
						isFollowedMessage={!!isFollowedMessage}
						msgSenderColor={msgSenderColor}
						name={name}
					/>
				)}

				{!!repliedTo && (
					<RepliedTo
						inte={inte}
						members={members}
						scrollToCid={scrollToCid}
						convKind={convKind}
						replyOf={replyOf}
						isFollowedMessage={isFollowedMessage}
						setHighlightCid={setHighlightCid}
						repliedTo={repliedTo}
						msgBackgroundColor={msgBackgroundColor}
						msgTextColor={msgTextColor}
					/>
				)}

				<View style={{ alignItems: inte.isMine ? 'flex-end' : 'flex-start' }}>
					<GestureHandler
						convPK={convPK}
						inte={inte}
						setIsMenuVisible={setIsMenuVisible}
						setMessageLayoutWidth={setMessageLayoutWidth}
						highlightCid={highlightCid}
						isFollowedMessage={isFollowedMessage}
						previousMessage={previousMessage}
						nextMessage={nextMessage}
						msgBackgroundColor={msgBackgroundColor}
						msgTextColor={msgTextColor}
						msgBorderColor={msgBorderColor || undefined}
					/>
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
					<TimestampStatus
						inte={inte}
						lastInte={lastInte}
						isFollowedMessage={isFollowedMessage}
						cmd={cmd}
					/>
				)}
			</View>
			<BottomModal isVisible={isMenuVisible} setIsVisible={setIsMenuVisible}>
				<MessageMenu
					convPk={convPK}
					cid={inte.cid!}
					onSelectEmoji={handleSelectEmoji}
					replyInteraction={{
						...inte,
						backgroundColor: msgBackgroundColor,
						textColor: msgTextColor,
					}}
					hide={() => setIsMenuVisible(false)}
				/>
			</BottomModal>
			<BottomModal isVisible={isEmojiVisible} setIsVisible={setIsEmojiVisible}>
				<EmojiKeyboard
					conversationPublicKey={convPK}
					targetCid={inte.cid!}
					hide={() => setIsEmojiVisible(false)}
					showBoard={isEmojiVisible}
				/>
			</BottomModal>
		</UserMessageWrapper>
	)
}
