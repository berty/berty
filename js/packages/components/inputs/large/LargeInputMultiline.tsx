import React, { useRef } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { InputPriv } from '../Input.priv'
import { InputProps } from '../interfaces'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const LargeInputMultiline: React.FC<InputProps> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={styles.container}>
			<InputPriv
				multiline
				ref={input}
				autoCapitalize='none'
				autoCorrect={false}
				accessibilityLabel={props.accessibilityLabel}
				value={props.value}
				placeholder={props.placeholder}
				onChangeText={props.onChangeText}
			/>
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#F7F8FE',
		borderRadius: 8,
		minHeight: 54,
		paddingHorizontal: 16,
		paddingVertical: 17,
	},
})
