import { Icon } from '@ui-kitten/components'
import React from 'react'

import { MenuItemProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'
import { TextPriv } from '../Text.priv'

export const MenuItem = (props: MenuItemProps) => {
	return (
		<MenuItemPriv onPress={props.onPress} testID={props.testID}>
			<TextPriv>{props.children}</TextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
		</MenuItemPriv>
	)
}
