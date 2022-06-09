import { Icon } from '@ui-kitten/components'
import React from 'react'

import { ItemMenuProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'
import { TextPriv } from './Text.priv'

export const ItemMenu: React.FC<ItemMenuProps> = props => {
	return (
		<ItemMenuPriv onPress={props.onPress}>
			<TextPriv>{props.children}</TextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill='#393C63' />
		</ItemMenuPriv>
	)
}
