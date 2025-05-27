import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { HardcodedAvatar, HardcodedAvatarKey } from '@berty/components/avatars'
import { useStyles } from '@berty/contexts/styles'

import { AddBotCallback } from './interfaces'
import { SuggestionButton } from './SuggestionButton'
import { SuggestionDescStatus } from './SuggestionDescStatus'
import { SuggestionTitle } from './SuggestionTitle'

export const SuggestionItem: React.FC<{
	displayName: string
	desc: string
	link: string
	addBot: AddBotCallback
	icon: string
	isLast: boolean
	style?: ViewStyle
}> = React.memo(({ displayName, desc, link, addBot, icon, style, isLast }) => {
	const { row, flex, margin } = useStyles()

	return (
		<SuggestionButton
			isLast={isLast}
			onPress={() => addBot({ displayName, link, isVisible: true })}
			style={style}
		>
			<View
				style={[
					row.item.center,
					flex.align.center,
					flex.justify.center,
					margin.right.small,
					styles.avatarWrapper,
				]}
			>
				<HardcodedAvatar size={40} name={icon as HardcodedAvatarKey} />
			</View>

			<View style={[flex.justify.spaceAround, styles.content]}>
				<SuggestionTitle displayName={displayName} />

				<SuggestionDescStatus description={desc} />
			</View>
		</SuggestionButton>
	)
})

const styles = StyleSheet.create({
	avatarWrapper: {
		flexBasis: 45,
		flexGrow: 0,
		flexShrink: 0,
	},
	content: {
		flexBasis: 2,
		flexGrow: 2,
		flexShrink: 0,
	},
})
