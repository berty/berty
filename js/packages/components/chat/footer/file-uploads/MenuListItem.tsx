import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store'

export const MenuListItem: React.FC<{
	title: string
	onPress: () => void
	iconProps: {
		name: string
		fill: string
		height?: number
		width?: number
		pack?: string
	}
}> = ({ title, iconProps, onPress }) => {
	const [{ text, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity onPress={onPress} style={[margin.horizontal.big, { alignItems: 'center' }]}>
			<Icon
				{...iconProps}
				height={iconProps.height || 50 * scaleSize}
				width={iconProps.width || 50 * scaleSize}
			/>
			<Text style={[text.align.center, margin.top.small, { color: colors['main-text'] }]}>
				{title}
			</Text>
		</TouchableOpacity>
	)
}
