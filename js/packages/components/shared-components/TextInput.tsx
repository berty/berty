import React, { FC } from 'react'
import { TextInputProps, TextInput as RNTextInput, View, ViewProps } from 'react-native'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { UnifiedText } from './UnifiedText'

export const TextInput: FC<
	TextInputProps & { containerStyle: ViewProps | ViewProps[]; error: string | null }
> = ({ style, containerStyle, error, ...props }) => {
	const { text, padding, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={containerStyle}>
			<RNTextInput
				placeholderTextColor={`${colors['main-text']}60`}
				{...props}
				style={[
					border.radius.small,
					text.size.medium,
					padding.medium,
					padding.top.medium,
					{
						flex: 1,
						fontFamily: 'Open Sans',
						backgroundColor: colors['input-background'],
						color: colors['background-header'],
					},
					style,
				]}
			/>
			{error ? (
				<View style={[padding.top.small, padding.horizontal.small]}>
					<UnifiedText style={[text.color.red, text.size.small]}>{error}</UnifiedText>
				</View>
			) : null}
		</View>
	)
}
