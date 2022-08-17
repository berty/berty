import React from 'react'
import { View } from 'react-native'

import beapi from '@berty/api'
import { MemberAvatar } from '@berty/components/avatars'
import { useStyles } from '@berty/contexts/styles'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

const AVATAR_SIZE = 30
const AVATAR_SPACE_RIGHT = 5

export const UserMessageWrapper: React.FC<{
	inte: InteractionUserMessage
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	convKind: beapi.messenger.Conversation.Type
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	children: React.ReactNode
	isGroup: boolean
	isFollowedMessage: boolean | undefined
}> = ({ inte, children, isGroup, isFollowedMessage }) => {
	const { row, padding, column } = useStyles()

	return (
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
	)
}
