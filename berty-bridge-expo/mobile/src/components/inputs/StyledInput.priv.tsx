import React from 'react'
import { StyleSheet, type TextInputInstance } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { InputPriv } from './Input.priv'
import { InputProps } from './interfaces'

export const StyledInputPriv = React.forwardRef<TextInputInstance, InputProps>(
	function StyledInputPriv(props, ref) {
	const { text } = useStyles()
	const colors = useThemeColor()

	return (
		<InputPriv
			ref={ref}
			style={[text.size.medium, styles.input, { color: colors['main-text'] }]}
			placeholderTextColor={!props.editable ? '#D0D0D6' : '#8E8E92'}
			{...props}
		/>
	)
})

const styles = StyleSheet.create({
	input: {
		flex: 1,
		fontFamily: 'Open Sans',
	},
})
