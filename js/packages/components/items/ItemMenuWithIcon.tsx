import { Icon } from '@ui-kitten/components'
import React from 'react'

import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from './IconWithText.priv'
import { ItemMenuWithIconProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'

export const ItemMenuWithIcon: React.FC<ItemMenuWithIconProps> = props => {
	const colors = useThemeColor()

	return (
		<ItemMenuPriv onPress={props.onPress}>
			<IconWithTextPriv iconName={props.iconName} color={colors['background-header']}>
				{props.children}
			</IconWithTextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
		</ItemMenuPriv>
	)
}
