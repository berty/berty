import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from './IconWithText.priv'
import { ItemMenuPriv } from './ItemMenu.priv'

interface FloatingItemMenuProps {
	onPress: () => void
	iconName: string
}

export const FloatingItemMenu: React.FC<FloatingItemMenuProps> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[{ shadowColor: colors.shadow }, border.shadow.medium, styles.container]}>
			<ItemMenuPriv onPress={props.onPress}>
				<IconWithTextPriv iconName={props.iconName}>{props.children}</IconWithTextPriv>
			</ItemMenuPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		backgroundColor: 'white',
		marginTop: 20,
	},
})
