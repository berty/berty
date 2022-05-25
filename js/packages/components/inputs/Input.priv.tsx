import React from 'react'
import { TextInput } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface InputPrivProps {
	value: string
	onChange: (text: string) => void
	placeholder?: string
}

export const InputPriv = React.forwardRef<TextInput, InputPrivProps>((props, ref) => {
	const { text } = useStyles()

	return (
		<TextInput
			ref={ref}
			// autoCapitalize='none'
			autoCorrect={false}
			value={props.value}
			onChangeText={props.onChange}
			placeholder={props.placeholder}
			style={[
				text.size.medium,
				{
					flex: 1,
					fontFamily: 'Open Sans',
					color: '#393C63',
				},
			]}
			placeholderTextColor='#8E8E92'
		/>
	)
})
