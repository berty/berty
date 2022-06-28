import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { defaultStylesDeclaration, useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export const SuggestionDescStatus: React.FC<{ description: string }> = ({ description }) => {
	const { flex, text, row } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				flex.direction.row,
				flex.align.center,
				{
					height: defaultStylesDeclaration.text.sizes.small * 1.8, // Keep row height even if no description/message
				},
			]}
		>
			<UnifiedText
				numberOfLines={1}
				style={[styles.description, text.size.small, { color: colors['secondary-text'] }]}
			>
				{description}
			</UnifiedText>

			{/* Message status */}
			<View style={[row.item.center, row.right, styles.messageStatus]}>
				<Icon name='info-outline' width={15} height={15} fill={colors['background-header']} />
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	description: {
		flexGrow: 2,
		flexShrink: 1,
	},
	messageStatus: {
		flexBasis: 16,
		flexGrow: 0,
		flexShrink: 0,
	},
})
