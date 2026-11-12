import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

export const HeaderPictoWrapperPriv: React.FC<{}> = props => {
	const colors = useThemeColor()
	return (
		<View style={[styles.avatar, { backgroundColor: colors['main-background'] }]}>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	avatar: {
		width: 98,
		height: 98,
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
