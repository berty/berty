import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'

import { CancelReply } from './CancelReply'
import { ContactReply } from './ContactReply'
import { ReplyMessageProps } from './interface'
import { ReplyMessage } from './ReplyMessage'

export const ReplyMessageBar: React.FC<ReplyMessageProps> = ({ convPK }) => {
	const { border } = useStyles()
	const activeReplyInteraction = useAppSelector(state =>
		selectActiveReplyInteraction(state, convPK),
	)

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
			<ContactReply convPK={convPK} />
			<ReplyMessage convPK={convPK} />
			<CancelReply convPK={convPK} />
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
