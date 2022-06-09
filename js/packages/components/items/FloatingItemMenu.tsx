import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { ItemMenuProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'
import { TextPriv } from './Text.priv'

export const FloatingItemMenu: React.FC<ItemMenuProps> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[{ shadowColor: colors.shadow }, border.shadow.medium, styles.container]}>
			<ItemMenuPriv onPress={props.onPress}>
				<TextPriv>{props.children}</TextPriv>
				<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
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
