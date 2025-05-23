import React from 'react'
import { TouchableHighlight, View, ViewStyle } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

interface SuggestionButtonProps {
	isLast: boolean
	onPress: () => void
	style?: ViewStyle
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = props => {
	const { row, border, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableHighlight
			underlayColor={`${colors['secondary-text']}80`}
			style={[padding.horizontal.medium, props.style]}
			onPress={props.onPress}
		>
			<View
				style={[
					row.center,
					!props.isLast && border.bottom.medium,
					border.color.light.grey,
					padding.vertical.scale(7),
				]}
			>
				{props.children}
			</View>
		</TouchableHighlight>
	)
}
