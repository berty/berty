import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { useInteraction, useMsgrContext } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'

import { pbDateToNum, timeFormat } from '../../helpers'
import { MessageInvitation } from './MessageInvitation'
import { MessageMonitorMetadata } from './MessageMonitorMetadata'
import { QuickReplyOptions } from './QuickReplyOptions'
import { UserMessage } from './UserMessage'

//
// Message => All messages (group/contact)
//

export const Message: React.FC<{
	id: string
	convKind: any
	members?: { [key: string]: any }
	convPK: string
	previousMessageId: string
	nextMessageId: string
}> = ({ id, convKind, members, previousMessageId, nextMessageId, convPK }) => {
	const ctx = useMsgrContext()
	const inte = useInteraction(id, convPK)
	const [{ text, padding }] = useStyles()
	if (!inte) {
		return null
	}
	const sentDate = pbDateToNum(inte?.sentDate)
	if (inte.type === messengerpb.AppMessage.Type.TypeUserMessage) {
		return (
			<UserMessage
				inte={inte}
				members={members}
				convPK={convPK}
				convKind={convKind}
				nextMessageId={nextMessageId}
				previousMessageId={previousMessageId}
			/>
		)
	} else if (
		inte.type === messengerpb.AppMessage.Type.TypeGroupInvitation &&
		convKind === messengerpb.Conversation.Type.ContactType
	) {
		return (
			<>
				<View style={[padding.horizontal.medium]}>
					<Text
						style={[
							inte.isMe ? text.align.right : text.align.left,
							text.color.grey,
							text.size.scale(11),
							text.bold.small,
							text.color.grey,
						]}
					>
						{sentDate ? timeFormat.fmtTimestamp3(sentDate) : ''}
					</Text>
				</View>
				<MessageInvitation message={inte} />
			</>
		)
	} else if (inte.type === messengerpb.AppMessage.Type.TypeReplyOptions) {
		return (
			<>
				<View style={[padding.horizontal.medium]}>
					<QuickReplyOptions convPk={convPK} options={inte?.payload?.options} />
				</View>
			</>
		)
	} else if (
		inte.type === messengerpb.AppMessage.Type.TypeMonitorMetadata &&
		ctx?.persistentOptions[PersistentOptionsKeys.Debug].enable
	) {
		return <MessageMonitorMetadata inte={inte} />
	} else {
		return null
	}
}
