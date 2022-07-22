import { Icon } from '@ui-kitten/components'
import Long from 'long'
import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useAppSelector, useThemeColor } from '@berty/hooks'
import { selectInteraction } from '@berty/redux/reducers/messenger.reducer'
import { getEmojiByName } from '@berty/utils/emojis/emojis'

import { EmojiNumber } from './EmojiNumber'

export const ReactionItem: FC<{
	onPress: () => void
	onLongPress: () => void
	emoji?: string | null | undefined
	ownState?: boolean | null | undefined
	count?: Long | null | undefined
}> = ({ emoji, ownState, count, onPress, onLongPress }) => {
	const { margin, padding, border, text } = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity key={`reaction-list${emoji}`} onPress={onPress} onLongPress={onLongPress}>
			<View
				style={[
					padding.tiny,
					margin.right.tiny,
					margin.bottom.tiny,
					border.radius.small,
					styles.item,
					{
						borderColor: colors['background-header'],
						backgroundColor: ownState ? colors['background-header'] : colors['input-background'],
					},
				]}
			>
				<UnifiedText style={[text.size.tiny, { marginHorizontal: 2 }]}>
					{`${getEmojiByName(emoji as string)}`}
				</UnifiedText>
				<EmojiNumber
					count={count as unknown as number}
					style={[
						text.size.tiny,
						{ color: ownState ? colors['main-background'] : colors['background-header'] },
					]}
				/>
			</View>
		</TouchableOpacity>
	)
}

export const AddReactionItem: FC<{
	convPk: string
	cid: string
	onEmojiKeyboard: () => void
}> = ({ convPk, cid, onEmojiKeyboard }) => {
	const inte = useAppSelector(state => selectInteraction(state, convPk, cid))
	const { margin, padding, border } = useStyles()
	const colors = useThemeColor()
	return !inte?.isMine ? (
		<TouchableOpacity onPress={onEmojiKeyboard}>
			<View
				style={[
					padding.tiny,
					margin.right.tiny,
					border.radius.small,
					{
						borderColor: colors['background-header'],
						backgroundColor: colors['input-background'],
						borderWidth: 1,
					},
				]}
			>
				<Icon name='plus-outline' width={18} height={18} fill={colors['background-header']} />
			</View>
		</TouchableOpacity>
	) : null
}

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		borderWidth: 1,
		alignItems: 'center',
	},
})
