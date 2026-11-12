import React, { useRef } from 'react'
import { StyleSheet, type TextInputInstance } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { IconPriv } from '../Icon.priv'
import { InputWithIconPriv } from '../InputWithIcon.priv'
import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

export const LargeInputWithIcon: React.FC<InputWithIconProps> = props => {
	const input = useRef<TextInputInstance>(null)
	const colors = useThemeColor()

	return (
		<TouchableWrapperWithIconPriv onPress={() => input.current?.focus()} style={[styles.container, { backgroundColor: colors['input-background'] }]}>
			<IconPriv
				iconColor='#AEAFC1'
				iconName={props.iconName}
				value={props.value}
				disabled={!props.editable}
			/>
			<InputWithIconPriv
				ref={input}
				{...props}
				autoCapitalize={props.autoCapitalize || 'none'}
				autoCorrect={props.autoCorrect || false}
			/>
		</TouchableWrapperWithIconPriv>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 8,
		height: 54,
		paddingHorizontal: 16,
	},
})
