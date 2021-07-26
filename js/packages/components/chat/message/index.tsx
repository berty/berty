import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'
import { ParsedInteraction } from '@berty-tech/store/types.gen'

import { pbDateToNum, timeFormat } from '../../helpers'
import { MessageInvitation } from './MessageInvitation'
import { MessageMonitorMetadata } from './MessageMonitorMetadata'
import { UserMessage } from './UserMessage'

//
// Message => All messages (group/contact)
//

export const Message: React.FC<{
	inte?: ParsedInteraction
	convKind: beapi.messenger.Conversation.Type
	members?: { [key: string]: any }
	convPK: string
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}> = ({ inte, convKind, members, previousMessage, nextMessage, convPK, replyOf, scrollToCid }) => {
	const ctx = useMsgrContext()
	const [{ text, padding }] = useStyles()
	const colors = useThemeColor()
	if (!inte) {
		return null
	}
	const sentDate = pbDateToNum(inte?.sentDate)

	if (inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		return (
			<>
				<UserMessage
					inte={inte}
					members={members}
					convPK={convPK}
					convKind={convKind}
					nextMessage={nextMessage}
					previousMessage={previousMessage}
					replyOf={replyOf}
					scrollToCid={scrollToCid}
				/>
			</>
		)
	} else if (
		inte.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation &&
		convKind === beapi.messenger.Conversation.Type.ContactType
	) {
		return (
			<>
				<View style={[padding.horizontal.medium]}>
					<Text
						style={[
							inte.isMine ? text.align.right : text.align.left,
							text.size.scale(11),
							text.bold.small,
							{ color: colors['secondary-text'] },
						]}
					>
						{sentDate ? timeFormat.fmtTimestamp3(sentDate) : ''}
					</Text>
				</View>
				<MessageInvitation message={inte} />
			</>
		)
	} else if (
		inte.type === beapi.messenger.AppMessage.Type.TypeMonitorMetadata &&
		ctx?.persistentOptions[PersistentOptionsKeys.Debug].enable
	) {
		return <MessageMonitorMetadata inte={inte} />
	} else {
		return null
	}
}
