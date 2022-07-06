import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export const Boosted: React.FC<{ boosted?: boolean }> = ({ boosted }) => {
	return (
		<View style={[styles.container, { backgroundColor: boosted ? '#3F46D0' : '#E9EAF1' }]}>
			<Icon pack='custom' name='transport-node' fill='#8E8E92' width={16} height={16} />
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 100,
		width: 28,
		height: 28,
		justifyContent: 'center',
		alignItems: 'center',
	},
})
