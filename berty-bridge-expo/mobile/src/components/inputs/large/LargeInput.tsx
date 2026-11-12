import React, { useRef } from 'react'
import { StyleSheet, type TextInputInstance } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { InputProps } from '../interfaces'
import { StyledInputPriv } from '../StyledInput.priv'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const LargeInput: React.FC<InputProps> = props => {
	const input = useRef<TextInputInstance>(null)
	const colors = useThemeColor()

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={[styles.container, { backgroundColor: colors['input-background'] }]}>
			<StyledInputPriv
				ref={input}
				{...props}
				autoCapitalize={props.autoCapitalize || 'none'}
				autoCorrect={props.autoCorrect || false}
			/>
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		height: 54,
		paddingHorizontal: 16,
	},
})
