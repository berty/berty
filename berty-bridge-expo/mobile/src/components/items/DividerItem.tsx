import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeColor } from '@berty/hooks'

export const DividerItem = () => {
	const colors = useThemeColor()
	return (
		<View
			style={[styles.container, { backgroundColor: colors['secondary-background'] ?? '#EDF1F7' }]}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		height: 1,
	},
})
