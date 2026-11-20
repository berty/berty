import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

interface ItemSectionProps {
	children?: React.ReactNode
	}

export const ItemSection = (props: ItemSectionProps) => {
	const { margin } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				margin.top.large,
				margin.horizontal.medium,
				styles.container,
				{ backgroundColor: colors['main-background'] },
			]}
		>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
	},
})
