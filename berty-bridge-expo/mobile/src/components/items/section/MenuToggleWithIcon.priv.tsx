import React from 'react'

import { Toggle } from '@berty/components'
import { useThemeColor } from '@berty/hooks'

import { IconWithTextPriv } from '../IconWithText.priv'
import { OnToggleProps, PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'

export const MenuToggleWithIconPriv: React.FC<React.PropsWithChildren<ToggleMenuItemWithIconProps & OnToggleProps & PackProps>> = props => {
	const colors = useThemeColor()

	return (
		<MenuItemPriv onPress={props.onPress} testID={props.testID}>
			<IconWithTextPriv
				iconName={props.iconName}
				pack={props.pack}
				color={colors['background-header']}
			>
				{props.children}
			</IconWithTextPriv>
			<Toggle
				checked={props.isToggleOn ?? false}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</MenuItemPriv>
	)
}
