import React from 'react'
import { StyleSheet, TextInput, TextInputProps } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

export const InputPriv = React.forwardRef<TextInput, Omit<TextInputProps, 'style'>>(
	(props, ref) => {
		const { text } = useStyles()

		return (
			<TextInput
				ref={ref}
				{...props}
				style={[text.size.medium, styles.input]}
				placeholderTextColor={!props.editable ? '#D0D0D6' : '#8E8E92'}
			/>
		)
	},
)

const styles = StyleSheet.create({
	input: {
		flex: 1,
		fontFamily: 'Open Sans',
		color: '#393C63',
	},
})
