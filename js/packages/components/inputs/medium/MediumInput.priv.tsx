import React from 'react'
import { StyleSheet } from 'react-native'

import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

interface MediumInputPrivProps {
	backgroundColor: string
}

export const MediumInputPriv: React.FC<InputWithIconProps & MediumInputPrivProps> = props => {
	return (
		<TouchableWrapperWithIconPriv
			value={props.value}
			onChange={props.onChange}
			iconName={props.iconName}
			iconColor='#8E8E92'
			placeholder={props.placeholder}
			style={[styles.button, { backgroundColor: props.backgroundColor }]}
		/>
	)
}

const styles = StyleSheet.create({
	button: {
		borderRadius: 14,
		height: 42,
		paddingHorizontal: 12,
		paddingVertical: 11,
	},
})
