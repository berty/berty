import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

interface ItemMenuPrivProps {
	onPress: () => void
}

export const ItemMenuPriv: React.FC<ItemMenuPrivProps> = props => {
	return (
		<TouchableOpacity style={styles.button} onPress={props.onPress}>
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
