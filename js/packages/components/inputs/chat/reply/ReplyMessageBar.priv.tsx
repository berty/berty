import React from 'react'
import { View, StyleSheet } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useAppSelector } from '@berty/hooks'
import { selectActiveReplyInteraction } from '@berty/redux/reducers/chatInputs.reducer'

import { CancelReply } from './CancelReply.priv'
import { ContactReply } from './ContactReply.priv'
import { ReplyMessageProps } from './interface'
import { ReplyMessage } from './ReplyMessage.priv'

export const ReplyMessageBar: React.FC<ReplyMessageProps> = ({ convPK }) => {
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
