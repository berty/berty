import React from 'react'
import { View, Text } from 'react-native'
import { useReplyReaction } from '../ReplyReactionContext'

export const MenuMessageModal = () => {
	const {
		activePopoverCid,
		setActivePopoverCid,
		setActiveReplyInte,
		setActiveEmojiKeyboardCid,
		highlightCid,
		setHighlightCid,
		setIsActivePopoverOnKeyboardClose,
	} = useReplyReaction()

	return (
		<View>
			<Text>Je suis le boss de ces lieux</Text>
		</View>
	)
}
