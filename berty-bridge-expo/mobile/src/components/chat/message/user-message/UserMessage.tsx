import React, { useState } from 'react'
import { View } from 'react-native'

import beapi from '@berty/api'
import { useLastConvInteraction, useThemeColor } from '@berty/hooks'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

import { getUserMessageState } from './getUserMessageState'
import { SenderName } from './SenderName'
import { TimestampStatus } from './TimestampStatus'
import { UserMessageBox } from './user-message-box/UserMessageBox'
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
	scrollToCid: (cid: string) => void
}

export const UserMessage: React.FC<UserMessageProps> = ({
	inte,
	members,
	convPK,
	convKind,
	previousMessage,
	nextMessage,
}) => {
	const isGroup = convKind === beapi.messenger.Conversation.Type.MultiMemberType
	const lastInte = useLastConvInteraction(convPK, interactionsFilter)
	const colors = useThemeColor()
	const [highlightCid] = useState<string | undefined | null>()

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

	return (
		<UserMessageWrapper
			inte={inte}
			members={members}
			convKind={convKind}
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

				<View style={{ alignItems: inte.isMine ? 'flex-end' : 'flex-start' }}>
					<UserMessageBox
						inte={inte}
						highlightCid={highlightCid}
						isFollowedMessage={isFollowedMessage}
						msgBackgroundColor={msgBackgroundColor}
						msgTextColor={msgTextColor}
						msgBorderColor={msgBorderColor || undefined}
					/>
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
		</UserMessageWrapper>
	)
}
