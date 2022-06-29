import React from 'react'
import { StyleSheet, View } from 'react-native'

export const HeaderPictoWrapperPriv: React.FC<{}> = props => {
	return <View style={styles.avatar}>{props.children}</View>
}

const styles = StyleSheet.create({
	avatar: {
		width: 98,
		height: 98,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		top: 50,
		zIndex: 1,
		elevation: 8,
		shadowOpacity: 0.1,
		shadowRadius: 40,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 10 },
		borderRadius: 100,
	},
})
