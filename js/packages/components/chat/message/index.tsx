import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import beapi from '@berty-tech/api'
import {
	pbDateToNum,
	ParsedInteraction,
	PersistentOptionsKeys,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { timeFormat } from '../../helpers'
import { MessageInvitation } from './MessageInvitation'
import { MessageMonitorMetadata } from './MessageMonitorMetadata'
import { UserMessage } from './UserMessage'

//
// Message => All messages (group/contact)
//

export const Message: React.FC<{
	inte?: ParsedInteraction
	convKind: beapi.messenger.Conversation.Type
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	convPK: string
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}> = React.memo(
	({ inte, convKind, members, previousMessage, nextMessage, convPK, replyOf, scrollToCid }) => {
		const ctx = useMessengerContext()
		const [{ text, padding }] = useStyles()
		const colors = useThemeColor()

		const sentDate = pbDateToNum(inte?.sentDate)

		const textColor = colors['secondary-text']
		const textStyle = React.useMemo(
			() => [
				inte?.isMine ? text.align.right : text.align.left,
				text.size.scale(11),
				text.bold.small,
				{ color: textColor },
			],
			[text.size, inte?.isMine, text.align.right, text.align.left, text.bold.small, textColor],
		)

		const viewStyle = React.useMemo(() => [padding.horizontal.medium], [padding.horizontal.medium])

		if (!inte) {
			return null
		}

		if (inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
			return (
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
			)
		} else if (
			inte.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation &&
			convKind === beapi.messenger.Conversation.Type.ContactType
		) {
			return (
				<>
					<View style={viewStyle}>
						<Text style={textStyle}>{sentDate ? timeFormat.fmtTimestamp3(sentDate) : ''}</Text>
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
	},
)
