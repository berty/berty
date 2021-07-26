import React from 'react'
import { Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

const Button: React.FC<{
	children: string
	onPress: () => void
	style?: ViewStyle
	textStyle?: TextStyle
}> = ({ children, onPress, style = null, textStyle = null }) => {
	const [{ margin, padding, text, border }] = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				padding.horizontal.big,
				margin.top.medium,
				padding.medium,
				border.radius.small,
				{ backgroundColor: colors['positive-asset'] },
				style,
			]}
			onPress={onPress}
		>
			<Text
				style={[
					text.size.medium,
					text.align.center,
					text.bold.medium,
					{ color: colors['background-header'] },
					textStyle,
				]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
