import React from 'react'
import { StyleSheet, View } from 'react-native'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { useToggle } from './hooks/useToggle'
import { IconWithTextPriv } from './IconWithText.priv'
import { ItemMenuPriv } from './ItemMenu.priv'

interface FloatingToggleMenuProps {
	onPress: () => void
	iconName: string
	isToggleOn?: boolean
}

export const FloatingToggleMenu: React.FC<FloatingToggleMenuProps> = props => {
	const isToggleOn = useToggle()
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[{ shadowColor: colors.shadow }, border.shadow.medium, styles.container]}>
			<ItemMenuPriv onPress={props.onPress}>
				<IconWithTextPriv iconName={props.iconName} pack='custom'>
					{props.children}
				</IconWithTextPriv>
				<Toggle status='primary' checked={isToggleOn} onChange={props.onPress} />
			</ItemMenuPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		backgroundColor: '#F7F8FE',
		marginTop: 20,
	},
})
