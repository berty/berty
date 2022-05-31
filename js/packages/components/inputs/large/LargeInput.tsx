import React, { useRef } from 'react'
import { StyleSheet, TextInput, TextInputProps } from 'react-native'

import { InputPriv } from '../Input.priv'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

export const LargeInput: React.FC<Omit<TextInputProps, 'style'>> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperWithIconPriv onPress={() => input.current?.focus()} style={styles.container}>
			<InputPriv ref={input} {...props} />
		</TouchableWrapperWithIconPriv>
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
