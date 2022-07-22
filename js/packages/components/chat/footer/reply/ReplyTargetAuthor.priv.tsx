import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useInteractionAuthor, useThemeColor } from '@berty/hooks'

import { UnifiedText } from '../../../shared-components/UnifiedText'
import { ActiveReplyInteractionProps } from './interface'

export const ReplyTargetAuthor: React.FC<ActiveReplyInteractionProps> = ({
	activeReplyInteraction,
}) => {
	const { t } = useTranslation()
	const { text } = useStyles()
	const colors = useThemeColor()

	const replyTargetAuthor = useInteractionAuthor(
		activeReplyInteraction?.conversationPublicKey || '',
		activeReplyInteraction?.cid || '',
	)

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: colors['input-background'],
					borderColor: colors['positive-asset'],
				},
			]}
		>
			<UnifiedText
				numberOfLines={1}
				style={[text.size.tiny, { color: colors['background-header'] }]}
			>
				{t('chat.reply.replying-to')} {replyTargetAuthor?.displayName || ''}
			</UnifiedText>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: -20,
		alignSelf: 'center',
		paddingVertical: 2,
		paddingHorizontal: 20,
		borderWidth: 1,
		borderRadius: 20,
	},
})
