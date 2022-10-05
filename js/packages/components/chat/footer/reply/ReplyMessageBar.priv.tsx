import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'

import { CancelReplyPriv } from './CancelReply.priv'
import { ReplyMessageProps } from './interface'
import { ReplyMessagePriv } from './reply-message/ReplyMessage.priv'
import { ReplyTargetAuthor } from './ReplyTargetAuthor.priv'

export const ReplyMessageBarPriv: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)
	const { border } = useStyles()

	if (!activeReplyInteraction) {
		return null
	}

	return (
		<View
			style={[
				styles.container,
				border.radius.top.medium,
				{ backgroundColor: activeReplyInteraction?.backgroundColor },
			]}
		>
			<ReplyTargetAuthor activeReplyInteraction={activeReplyInteraction} />
			<ReplyMessagePriv activeReplyInteraction={activeReplyInteraction} />
			<CancelReplyPriv convPK={convPK} activeReplyInteraction={activeReplyInteraction} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 4,
		paddingLeft: 10,
		paddingRight: 18,
		zIndex: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
})
