import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { MenuItemProps } from './interfaces'

export const MenuItemPriv: React.FC<MenuItemProps> = props => {
	return (
		<TouchableOpacity style={styles.button} onPress={props.onPress} testID={props.testID}>
			{props.children}
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	button: {
		height: 48,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
	},
})
