import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'

import { UserMessageBoxProps } from '../interfaces'
import { HyperlinkUserMessage } from './HyperlinkUserMessage'

export const UserMessageBox: React.FC<UserMessageBoxProps> = ({
	inte,
	setMessageLayoutWidth,
	setIsMenuVisible,
	highlightCid,
	isFollowedMessage,
	msgBorderColor,
	msgBackgroundColor,
	msgTextColor,
}) => {
	const isHighlight = highlightCid === inte.cid

	const togglePopover = useCallback(() => {
		if (inte.isMine) {
			return
		}
		setIsMenuVisible(true)
	}, [setIsMenuVisible, inte.isMine])

	return (
		<TouchableOpacity
			onLayout={event => setMessageLayoutWidth(event.nativeEvent.layout.width)}
			disabled={inte.isMine}
			activeOpacity={0.9}
			onLongPress={togglePopover}
			style={{ marginBottom: inte?.reactions?.length ? 10 : 0 }}
		>
			<HyperlinkUserMessage
				inte={inte}
				msgBorderColor={msgBorderColor}
				isFollowedMessage={isFollowedMessage}
				msgBackgroundColor={msgBackgroundColor}
				msgTextColor={msgTextColor}
				isHighlight={isHighlight}
			/>
		</TouchableOpacity>
	)
}
