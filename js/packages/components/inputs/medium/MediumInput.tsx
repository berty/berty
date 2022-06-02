import React, { useRef } from 'react'
import { StyleSheet, TextInput } from 'react-native'

import { IconPriv } from '../Icon.priv'
import { InputWithIconPriv } from '../InputWithIcon.priv'
import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperPriv } from '../wrapper/TouchableWrapper.priv'

export const MediumInput: React.FC<InputWithIconProps> = props => {
	const input = useRef<TextInput>(null)

	return (
		<TouchableWrapperPriv onPress={() => input.current?.focus()} style={styles.button}>
			<IconPriv
				iconColor='#8E8E92'
				iconName={props.iconName}
				value={props.value}
				disabled={!props.editable}
			/>
			<InputWithIconPriv
				ref={input}
				accessibilityLabel={props.accessibilityLabel}
				value={props.value}
				placeholder={props.placeholder}
				onChangeText={props.onChangeText}
			/>
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: '#F2F2F2',
		borderRadius: 14,
		height: 42,
		paddingHorizontal: 12,
		paddingVertical: 11,
	},
})
