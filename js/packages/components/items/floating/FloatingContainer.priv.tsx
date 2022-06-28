import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export const FloatingContainerPriv: React.FC<{ backgroundColor?: string }> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{ shadowColor: colors.shadow, backgroundColor: props.backgroundColor ?? 'white' },
				border.shadow.medium,
				styles.container,
			]}
		>
			{props.children}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		marginTop: 20,
	},
})
