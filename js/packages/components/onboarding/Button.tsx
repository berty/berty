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
				margin.top.medium,
				padding.medium,
				border.radius.small,
				{ backgroundColor: colors['background-header'] },
				style,
			]}
			onPress={onPress}
		>
			<Text
				style={[
					text.size.medium,
					text.align.center,
					text.bold.medium,
					{ color: colors['reverted-main-text'] },
					textStyle,
				]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
