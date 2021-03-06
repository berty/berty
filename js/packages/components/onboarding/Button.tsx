import React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'

const Button: React.FC<{
	children: string
	onPress: () => void
	style?: ViewStyle
	textStyle?: TextStyle
}> = ({ children, onPress, style = null, textStyle = null }) => {
	const [{ margin, padding, text, border }] = useStyles()
	return (
		<TouchableOpacity
			style={[
				padding.horizontal.big,
				margin.top.medium,
				padding.medium,
				border.radius.small,
				{ backgroundColor: '#CED2FF' },
				style,
			]}
			onPress={onPress}
		>
			<Text
				style={[text.size.medium, text.color.blue, text.align.center, text.bold.medium, textStyle]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
