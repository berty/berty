import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export const Boosted: React.FC<{ boosted?: boolean }> = ({ boosted }) => {
	return (
		<View style={styles.container}>
			<Icon
				pack='custom'
				name='transport-node'
				fill={boosted ? '#3F46D0' : '#8E8E92'}
				width={16}
				height={16}
			/>
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
		backgroundColor: '#E9EAF1',
	},
})
