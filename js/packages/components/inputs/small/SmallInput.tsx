import React, { useRef } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { InputPriv } from '../Input.priv'
import { InputProps } from '../interfaces'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const SmallInput: React.FC<InputProps> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={styles.button}>
			<InputPriv ref={input} {...props} />
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: '#F7F8FE',
		borderRadius: 8,
		height: 36,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
})
