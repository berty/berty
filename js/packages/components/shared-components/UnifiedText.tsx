import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import React from 'react'
import { Text, TextProps } from 'react-native'

export const UnifiedText: React.FC<TextProps> = props => {
	const { children, style } = props
	const colors = useThemeColor()
	const [{ text }] = useStyles()
	return (
		<Text
			{...props}
			style={[text.size.medium, { fontFamily: 'Open Sans', color: colors['main-text'] }, style]}
		>
			{children}
		</Text>
	)
}
