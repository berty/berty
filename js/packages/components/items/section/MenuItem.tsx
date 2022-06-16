import { Icon } from '@ui-kitten/components'
import React from 'react'

import { MenuItemProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'
import { TextPriv } from '../Text.priv'

export const MenuItem: React.FC<MenuItemProps> = props => {
	return (
		<MenuItemPriv onPress={props.onPress} accessibilityLabel={props.accessibilityLabel}>
			<TextPriv>{props.children}</TextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
		</MenuItemPriv>
	)
}
