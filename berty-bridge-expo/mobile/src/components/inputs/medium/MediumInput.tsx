import React, { useRef } from 'react'
import { StyleSheet, type TextInputInstance } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { IconPriv } from '../Icon.priv'
import { InputWithIconPriv } from '../InputWithIcon.priv'
import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

export const MediumInput: React.FC<InputWithIconProps> = props => {
	const input = useRef<TextInputInstance>(null)
	const colors = useThemeColor()

	return (
		<TouchableWrapperWithIconPriv onPress={() => input.current?.focus()} style={[styles.button, { backgroundColor: colors['input-background'] }]}>
			<IconPriv
				iconColor='#8E8E92'
				iconName={props.iconName}
				value={props.value}
				disabled={!props.editable}
			/>
			<InputWithIconPriv ref={input} {...props} autoCorrect={props.autoCorrect || false} />
		</TouchableWrapperWithIconPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 14,
		height: 42,
		paddingHorizontal: 12,
	},
})
