import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'

export const ButtonPriv: React.FC<TouchableOpacityProps> = props => {
	return (
		<TouchableOpacity {...props} style={[styles.button, props.style]} onPress={props.onPress}>
			{props.children}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	button: {
		height: 44,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
})
