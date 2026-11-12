import React, { useRef } from 'react'
import { StyleSheet, type TextInputInstance } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { InputProps } from '../interfaces'
import { StyledInputPriv } from '../StyledInput.priv'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const SmallInput: React.FC<InputProps> = props => {
	const input = useRef<TextInputInstance>(null)
	const colors = useThemeColor()

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={[styles.button, { backgroundColor: colors['input-background'] }]}>
			<StyledInputPriv ref={input} {...props} />
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 8,
		height: 36,
		paddingHorizontal: 12,
	},
})
