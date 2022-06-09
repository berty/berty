import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from './IconWithText.priv'
import { ItemMenuWithIconProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'

export const FloatingItemMenuWithIconPriv: React.FC<
	ItemMenuWithIconProps & { color?: string; pack?: string }
> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[{ shadowColor: colors.shadow }, border.shadow.medium, styles.container]}>
			<ItemMenuPriv onPress={props.onPress}>
				<IconWithTextPriv pack={props.pack} iconName={props.iconName} color={props.color}>
					{props.children}
				</IconWithTextPriv>
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
