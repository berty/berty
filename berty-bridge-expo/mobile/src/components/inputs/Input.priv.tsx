import React from 'react'
import { TextInput, TextInputProps } from 'react-native'

export const InputPriv = React.forwardRef<TextInput, TextInputProps>((props, ref) => {
	return <TextInput ref={ref} {...props} />
})
