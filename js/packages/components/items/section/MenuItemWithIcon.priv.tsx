import { Icon } from '@ui-kitten/components'
import React from 'react'

import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from '../IconWithText.priv'
import { MenuItemWithIconProps, PackProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'

export const MenuItemWithIconPriv: React.FC<
	MenuItemWithIconProps & PackProps & { color?: string }
> = props => {
	const colors = useThemeColor()

	return (
		<MenuItemPriv onPress={props.onPress}>
			<IconWithTextPriv
				iconName={props.iconName}
				pack={props.pack}
				color={props.color ?? colors['background-header']}
			>
				{props.children}
			</IconWithTextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
		</MenuItemPriv>
	)
}
