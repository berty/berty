import React from 'react'
import { Text, TouchableOpacity, ViewStyle } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

const Button: React.FC<{
	children: string
	onPress: () => void
	width?: number
	status?: 'primary' | 'secondary'
	style?: ViewStyle
}> = ({ children, onPress, width = 250, status = 'primary', style = null }) => {
	const [{ margin, padding, text, border, column }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				margin.top.small,
				padding.medium,
				border.radius.small,
				column.item.center,
				{
					width: width * scaleSize,
					backgroundColor:
						status === 'primary' ? colors['background-header'] : `${colors['background-header']}20`,
				},
				style,
			]}
			onPress={onPress}
		>
			<Text
				style={[
					text.size.medium,
					text.align.center,
					text.bold.medium,
					{
						color:
							status === 'primary' ? colors['reverted-main-text'] : colors['background-header'],
						textTransform: 'uppercase',
					},
				]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	)
}

export default Button
