import React, { FC, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { BottomModal } from '@berty/components'
import { useAppSelector } from '@berty/hooks'
import { selectInteraction } from '@berty/redux/reducers/messenger.reducer'

import { ReactionListModal } from '../../modals/reactions-modal/ReactionList.modal'
import { ReactionItem, AddReactionItem } from './ReactionItem'

export const Reactions: FC<{
	onEmojiKeyboard: () => void
	onPressEmoji: (emoji: string, remove: boolean) => void
	cid: string
	convPk: string
}> = ({ onEmojiKeyboard, onPressEmoji, cid, convPk }) => {
	const inte = useAppSelector(state => selectInteraction(state, convPk, cid))
	const reactions = inte?.reactions || []
	const [isVisible, setIsVisible] = useState<boolean>(false)
	const [emoji, setEmoji] = useState<string | null | undefined>('')

	if (!inte?.reactions || !inte?.reactions.length) {
		return null
	}

	return (
		<>
			<View
				style={[styles.container, { justifyContent: inte?.isMine ? 'flex-end' : 'flex-start' }]}
			>
				{inte.reactions
					.filter(({ emoji }) => typeof emoji === 'string')
					.map(props => (
						<ReactionItem
							key={props.emoji}
							{...props}
							onPress={() => {
								if (props.ownState) {
									onPressEmoji(props.emoji!, true)
								} else {
									onPressEmoji(props.emoji!, false)
								}
							}}
							onLongPress={() => {
								setEmoji(props.emoji)
								setIsVisible(true)
							}}
						/>
					))}
				<AddReactionItem convPk={convPk} cid={cid} onEmojiKeyboard={onEmojiKeyboard} />
			</View>
			{isVisible && emoji && (
				<BottomModal isVisible={isVisible} setIsVisible={setIsVisible}>
					<ReactionListModal reactions={reactions} emoji={emoji} cid={cid} convPk={convPk} />
				</BottomModal>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
})
