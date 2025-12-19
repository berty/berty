import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface ItemSectionProps {
	children?: React.ReactNode
	}

export const ItemSection = (props: ItemSectionProps) => {
	const { margin } = useStyles()

	return (
		<View style={[margin.top.large, margin.horizontal.medium, styles.container]}>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		backgroundColor: 'white',
	},
})
