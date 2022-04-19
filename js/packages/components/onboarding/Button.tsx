import React from 'react'
import { TextStyle, TouchableOpacity, ViewStyle } from 'react-native'

import { useStyles } from '@berty/styles'
import { useThemeColor } from '@berty/store/hooks'
import { UnifiedText } from '../shared-components/UnifiedText'

const Button: React.FC<{
	onPress: () => void
	width?: number
	status?: 'primary' | 'secondary'
	disabled?: boolean
	style?: ViewStyle | ViewStyle[]
	textStyle?: TextStyle | TextStyle[]
}> = ({
	children,
	onPress,
	width = 250,
	status = 'primary',
	style = null,
	disabled,
	textStyle,
}) => {
	const [{ margin, padding, text, border, column }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	const getBackgroundColor = () => {
		if (disabled) {
			return colors['secondary-text']
		}
		return status === 'primary' ? colors['background-header'] : `${colors['background-header']}20`
	}
	return (
		<TouchableOpacity
			disabled={disabled}
			style={[
				margin.top.small,
				padding.medium,
				border.radius.small,
				column.item.center,
				style,
				{
					width: width * scaleSize,
					backgroundColor: getBackgroundColor(),
				},
			]}
			onPress={onPress}
		>
			<UnifiedText
				style={[
					text.align.center,
					text.bold,
					{
						color:
							status === 'primary' ? colors['reverted-main-text'] : colors['background-header'],
						textTransform: 'uppercase',
					},
					textStyle,
				]}
			>
				{children}
			</UnifiedText>
		</TouchableOpacity>
	)
}

export default Button
