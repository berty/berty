import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from '../IconWithText.priv'
import { OnToggleProps, PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'

export const MenuToggleWithIconPriv: React.FC<
	ToggleMenuItemWithIconProps & OnToggleProps & PackProps
> = props => {
	const colors = useThemeColor()

	return (
		<MenuItemPriv onPress={props.onPress}>
			<IconWithTextPriv
				iconName={props.iconName}
				pack={props.pack}
				color={colors['background-header']}
			>
				{props.children}
			</IconWithTextPriv>
			<Toggle
				status='primary'
				checked={props.isToggleOn ?? false}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</MenuItemPriv>
	)
}
