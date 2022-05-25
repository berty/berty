import React from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { InputProps } from './interfaces'

export const InputPriv = React.forwardRef<TextInput, InputProps>((props, ref) => {
	const { text } = useStyles()

	return (
		<TextInput
			ref={ref}
			// autoCapitalize='none'
			// autoCorrect={false}
			editable={!props.disabled}
			value={props.value}
			onChangeText={props.onChange}
			placeholder={props.placeholder}
			style={[text.size.medium, styles.input]}
			placeholderTextColor={props.disabled ? '#D0D0D6' : '#8E8E92'}
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
