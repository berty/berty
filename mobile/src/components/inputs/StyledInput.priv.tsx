import React from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { InputPriv } from './Input.priv'
import { InputProps } from './interfaces'

export const StyledInputPriv = React.forwardRef<TextInput, InputProps>((props, ref) => {
	const { text } = useStyles()

	return (
		<InputPriv
			ref={ref}
			style={[text.size.medium, styles.input]}
			placeholderTextColor={!props.editable ? '#D0D0D6' : '#8E8E92'}
			{...props}
		/>
	)
})

const styles = StyleSheet.create({
	input: {
		flex: 1,
		fontFamily: 'Open Sans',
		color: '#393C63',
	},
})
