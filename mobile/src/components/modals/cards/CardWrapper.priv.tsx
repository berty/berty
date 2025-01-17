import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

export const CardWrapperPriv: React.FC<{}> = props => {
	const { margin } = useStyles()

	return <View style={[styles.container, margin.big]}>{props.children}</View>
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 250,
		top: '25%',
	},
})
