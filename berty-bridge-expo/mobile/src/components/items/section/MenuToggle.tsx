import React from 'react'

import { Toggle } from '@berty/components'

import { IsToggleProps, MenuItemProps, OnToggleProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'
import { TextPriv } from '../Text.priv'

export const MenuToggle: React.FC<MenuItemProps & OnToggleProps & IsToggleProps> = props => {
	return (
		<MenuItemPriv onPress={props.onPress} testID={props.testID}>
			<TextPriv>{props.children}</TextPriv>
			<Toggle
				checked={props.isToggleOn ?? false}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</MenuItemPriv>
	)
}
