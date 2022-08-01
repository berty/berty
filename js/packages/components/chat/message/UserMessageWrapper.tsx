import React from 'react'
import { View } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'
import { BottomModal } from '@berty/components/modals'
import { useStyles } from '@berty/contexts/styles'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

import { EmojiKeyboard } from '../modals/EmojiKeyboard.modal'
import { MessageMenu } from '../modals/MessageMenu.modal'

const AVATAR_SIZE = 30
const AVATAR_SPACE_RIGHT = 5

export const UserMessageWrapper: React.FC<{
	inte: InteractionUserMessage
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	convPK: string
	convKind: beapi.messenger.Conversation.Type
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	isMenuVisible: boolean
	setIsMenuVisible: (isMenuVisible: boolean) => void
	isEmojiVisible: boolean
	setIsEmojiVisible: (isEmojiVisible: boolean) => void
	children: JSX.Element
	isGroup: boolean
	handleSelectEmoji: (emoji: string, remove?: boolean) => void
	isFollowedMessage: boolean | undefined
	msgTextColor: string
	msgBackgroundColor: string
}> = ({
	inte,
	convPK,
	isMenuVisible,
	setIsMenuVisible,
	isEmojiVisible,
	setIsEmojiVisible,
	children,
	isGroup,
	handleSelectEmoji,
	isFollowedMessage,
	msgTextColor,
	msgBackgroundColor,
}) => {
	const { row, padding, column } = useStyles()

	return (
		<>
			<View
				style={[
					row.left,
					inte.isMine ? row.item.bottom : row.item.top,
					{ maxWidth: '90%' },
					padding.horizontal.medium,
					padding.top.scale(2),
				]}
			>
				{!inte.isMine && isGroup && !isFollowedMessage && (
					<View
						style={{
							paddingRight: AVATAR_SPACE_RIGHT,
							paddingBottom: 5,
							justifyContent: 'center',
							alignItems: 'center',
							alignSelf: 'flex-end',
						}}
					>
						<MemberAvatar
							publicKey={inte.memberPublicKey}
							conversationPublicKey={inte.conversationPublicKey}
							size={AVATAR_SIZE}
							pressable
						/>
					</View>
				)}

				<View style={[column.top, { flexDirection: 'row' }]}>{children}</View>
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
		</>
	)
}
