import React from 'react'
import { Text, TextProps } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export const UnifiedText: React.FC<TextProps> = props => {
	const { children, style } = props
	const colors = useThemeColor()
	const { text } = useStyles()
	return (
		<Text
			{...props}
			style={[text.size.medium, { fontFamily: 'Open Sans', color: colors['main-text'] }, style]}
		>
			{children}
		</Text>
	)
}
