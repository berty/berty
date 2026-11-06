import React from 'react'
import { TextInput, TextInputProps, type TextInputInstance } from 'react-native'

export const InputPriv = React.forwardRef<TextInputInstance, TextInputProps>(function InputPriv(props, ref) {
	return <TextInput ref={ref} {...props} />
})
