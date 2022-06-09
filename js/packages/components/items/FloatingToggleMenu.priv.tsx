import React from 'react'
import { StyleSheet, View } from 'react-native'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from './IconWithText.priv'
import { ToggleItemMenuWithIconProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'

export const FloatingToggleMenuPriv: React.FC<
	ToggleItemMenuWithIconProps & { pack?: string; backgroundColor?: string }
> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{ shadowColor: colors.shadow, backgroundColor: props.backgroundColor ?? '#F7F8FE' },
				border.shadow.medium,
				styles.container,
			]}
		>
			<ItemMenuPriv onPress={props.onPress}>
				<IconWithTextPriv
					iconName={props.iconName}
					pack={props.pack}
					color={colors['background-header']}
				>
					{props.children}
				</IconWithTextPriv>
				<Toggle status='primary' checked={props.isToggleOn ?? false} onChange={props.onPress} />
			</ItemMenuPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		marginTop: 20,
	},
})
