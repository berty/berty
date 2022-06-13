import React, { useRef } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { InputProps } from '../interfaces'
import { StyledInputPriv } from '../StyledInput.priv'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const LargeInput: React.FC<InputProps> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={styles.container}>
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
		backgroundColor: '#F7F8FE',
		borderRadius: 8,
		height: 54,
		paddingHorizontal: 16,
		paddingVertical: 17,
	},
})
