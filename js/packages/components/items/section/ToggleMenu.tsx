import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'

import { IsToggleProps, ItemMenuProps, OnToggleMenuProps } from '../interfaces'
import { ItemMenuPriv } from '../ItemMenu.priv'
import { TextPriv } from '../Text.priv'

export const ToggleMenu: React.FC<ItemMenuProps & OnToggleMenuProps & IsToggleProps> = props => {
	return (
		<ItemMenuPriv onPress={props.onPress}>
			<TextPriv>{props.children}</TextPriv>
			<Toggle
				status='primary'
				checked={props.isToggleOn ?? false}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</ItemMenuPriv>
	)
}
