import React from 'react'
import { Text, TouchableOpacity, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'

const Button: React.FC<{
	children: string
	onPress: () => void
	style?: ViewStyle
}> = ({ children, onPress, style = null }) => {
	const [{ margin, padding, text, border }] = useStyles()
	return (
		<TouchableOpacity
			style={[
				padding.horizontal.big,
				margin.top.medium,
				padding.medium,
				border.radius.small,
				style,
				{ backgroundColor: '#CED2FF' },
			]}
			onPress={onPress}
		>
			<Text style={[text.size.medium, text.color.blue, text.align.center, text.bold.medium]}>
				{children}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
