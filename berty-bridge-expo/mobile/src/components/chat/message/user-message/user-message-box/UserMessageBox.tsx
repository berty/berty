import React from 'react'
import { View } from 'react-native'

import { UserMessageBoxProps } from '../interfaces'
import { HyperlinkUserMessage } from './HyperlinkUserMessage'

export const UserMessageBox: React.FC<UserMessageBoxProps> = ({
	inte,
	highlightCid,
	isFollowedMessage,
	msgBorderColor,
	msgBackgroundColor,
	msgTextColor,
}) => {
	const isHighlight = highlightCid === inte.cid

	return (
		<View>
			<HyperlinkUserMessage
				inte={inte}
				msgBorderColor={msgBorderColor}
				isFollowedMessage={isFollowedMessage}
				msgBackgroundColor={msgBackgroundColor}
				msgTextColor={msgTextColor}
				isHighlight={isHighlight}
			/>
		</View>
	)
}
