import React, { useRef } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { IconPriv } from '../Icon.priv'
import { InputWithIconPriv } from '../InputWithIcon.priv'
import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

export const LargeInput: React.FC<InputWithIconProps> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperWithIconPriv onPress={() => input.current?.focus()} style={styles.container}>
			<IconPriv
				iconColor='#AEAFC1'
				iconName={props.iconName}
				value={props.value}
				disabled={props.disabled}
			/>
			<InputWithIconPriv
				ref={input}
				value={props.value}
				onChange={props.onChange}
				placeholder={props.placeholder}
				disabled={props.disabled}
			/>
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
