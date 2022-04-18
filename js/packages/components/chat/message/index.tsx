import React from 'react'
import { View } from 'react-native'
import { Dictionary } from '@reduxjs/toolkit'

import beapi from '@berty/api'
import { pbDateToNum, ParsedInteraction, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

import { timeFormat } from '../../helpers'
import { MessageInvitation } from './MessageInvitation'
import { MessageMonitorMetadata } from './MessageMonitorMetadata'
import { UserMessage } from './UserMessage'
import { useSelector } from 'react-redux'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { UnifiedText } from '../../shared-components/UnifiedText'

//
// Message => All messages (group/contact)
//

export const Message: React.FC<{
	inte?: ParsedInteraction
	convKind: beapi.messenger.Conversation.Type
	members?: Dictionary<beapi.messenger.IMember>
	convPK: string
	previousMessage?: ParsedInteraction
	nextMessage?: ParsedInteraction
	replyOf?: ParsedInteraction
	scrollToCid: (cid: string) => void
}> = React.memo(
	({ inte, convKind, members, previousMessage, nextMessage, convPK, replyOf, scrollToCid }) => {
		const persistentOptions = useSelector(selectPersistentOptions)
		const { text, padding } = useStyles()
		const colors = useThemeColor()

		const sentDate = pbDateToNum(inte?.sentDate)

		const textColor = colors['secondary-text']
		const textStyle = React.useMemo(
			() => [
				inte?.isMine ? text.align.right : text.align.left,
				text.size.tiny,
				text.light,
				{ color: textColor },
			],
			[text.size, inte?.isMine, text.align.right, text.align.left, text.light, textColor],
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
						<UnifiedText style={textStyle}>
							{sentDate ? timeFormat.fmtTimestamp3(sentDate) : ''}
						</UnifiedText>
					</View>
					<MessageInvitation message={inte} />
				</>
			)
		} else if (
			inte.type === beapi.messenger.AppMessage.Type.TypeMonitorMetadata &&
			persistentOptions[PersistentOptionsKeys.Debug].enable
		) {
			return <MessageMonitorMetadata inte={inte} />
		} else {
			return null
		}
	},
)
