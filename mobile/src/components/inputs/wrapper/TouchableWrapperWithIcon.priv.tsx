import React from 'react'
import { StyleSheet } from 'react-native'

import { TouchableWrapperProps } from '../interfaces'
import { TouchableWrapperPriv } from './TouchableWrapper.priv'

export const TouchableWrapperWithIconPriv: React.FC<TouchableWrapperProps> = props => {
	return (
		<TouchableWrapperPriv style={[styles.button, props.style]} onPress={props.onPress}>
			{props.children}
		</TouchableWrapperPriv>
	)
}

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
})
