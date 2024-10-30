import React from 'react'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { defaultStylesDeclaration, useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { ParsedInteraction } from '@berty/utils/api'

import { MessageStatus } from './MessageStatus'

interface ConversationDescStatusProps {
	description: string
	chatInputText: string
	unreadCount: number | undefined
	lastInte: ParsedInteraction | undefined
	chatInputIsSending: boolean
	isAccepted: boolean
}

export const ConversationDescStatus: React.FC<ConversationDescStatusProps> = props => {
	const colors = useThemeColor()
	const { flex, row, text } = useStyles()

	return (
		<View
			style={[
				flex.direction.row,
				flex.align.center,
				{
					height: defaultStylesDeclaration.text.sizes.small * 1.8, // Keep row height even if no description/message
				},
			]}
		>
			<UnifiedText
				numberOfLines={1}
				style={[
					styles.description,
					(props.chatInputText ||
						props.lastInte?.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation) &&
						text.italic,
					text.size.small,
					props.unreadCount ? [text.bold] : { color: colors['secondary-text'] },
				]}
			>
				{props.description}
			</UnifiedText>

			{/* Message status */}
			<View style={[row.item.center, row.right, styles.messageStatus]}>
				{props.lastInte && props.lastInte.isMine && (
					<MessageStatus
						interaction={props.lastInte}
						isAccepted={props.isAccepted}
						sending={props.chatInputIsSending}
					/>
				)}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	description: {
		flexGrow: 2,
		flexShrink: 1,
	},
	messageStatus: {
		flexBasis: 16,
		flexGrow: 0,
		flexShrink: 0,
	},
})
