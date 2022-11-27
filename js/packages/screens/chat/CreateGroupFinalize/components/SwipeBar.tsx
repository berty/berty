import React from 'react'
import { StyleSheet, View } from 'react-native'

export const SwipeBar = () => {
	return <View style={styles.content} />
}

const styles = StyleSheet.create({
	content: {
		alignSelf: 'center',
		borderRadius: 4,
		marginTop: 7,
		backgroundColor: '#D0D0D6',
		height: 4,
		width: 42,
	},
})
