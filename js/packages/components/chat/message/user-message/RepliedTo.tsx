import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { InteractionUserMessage, ParsedInteraction } from '@berty/utils/api'

const AVATAR_SIZE = 30
const AVATAR_SPACE_RIGHT = 5

interface UserMessageRepliedToProps {
	inte: InteractionUserMessage
	members?: { [key: string]: beapi.messenger.IMember | undefined }
	scrollToCid: (cid: string) => void
	convKind: beapi.messenger.Conversation.Type
	replyOf?: ParsedInteraction
	isFollowedMessage: boolean | undefined
	setHighlightCid: (value: string) => void
	repliedTo:
		| beapi.messenger.IMember
		| beapi.messenger.IContact
		| beapi.messenger.IAccount
		| undefined
	msgBackgroundColor: string
	msgTextColor: string
}

export const RepliedTo: React.FC<UserMessageRepliedToProps> = props => {
	const { t } = useTranslation()
	const colors = useThemeColor()
	const { border, text } = useStyles()

	return (
		<View
			style={[
				{
					alignSelf: props.inte?.isMine ? 'flex-end' : 'flex-start',
					alignItems: props.inte?.isMine ? 'flex-end' : 'flex-start',
					marginTop: 7,
				},
				props.isFollowedMessage && {
					marginLeft: AVATAR_SIZE + AVATAR_SPACE_RIGHT,
				},
			]}
		>
			<View
				style={[
					styles.wrapper,
					{ backgroundColor: colors['input-background'], borderColor: colors['negative-asset'] },
				]}
			>
				<UnifiedText
					numberOfLines={1}
					style={[text.size.tiny, { color: colors['background-header'] }]}
				>
					<>
						{t('chat.reply.replied-to')} {props.repliedTo?.displayName || ''}
					</>
				</UnifiedText>
			</View>

			<TouchableOpacity
				onPress={() => {
					if (!props.replyOf?.cid) {
						return
					}
					props.scrollToCid(props.replyOf.cid)
					props.setHighlightCid(props.replyOf.cid)
				}}
				style={[
					border.radius.top.medium,
					props.inte.isMine ? border.radius.left.medium : border.radius.right.medium,
					styles.button,
					{ backgroundColor: props.msgBackgroundColor },
				]}
			>
				<UnifiedText
					numberOfLines={1}
					style={[text.size.tiny, { color: props.msgTextColor, lineHeight: 17 }]}
				>
					{props.replyOf?.type === beapi.messenger.AppMessage.Type.TypeUserMessage &&
						props.replyOf?.payload?.body}
				</UnifiedText>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		paddingVertical: 1.5,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderRadius: 20,
		marginBottom: -5,
		zIndex: 2,
	},
	button: {
		marginBottom: -15,
		padding: 10,
		paddingBottom: 20,
	},
})
