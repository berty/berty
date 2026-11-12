import { Icon } from '@ui-kitten/components'
import React from 'react'

import { useThemeColor } from '@berty/hooks'

import { MenuItemProps } from '../interfaces'
import { MenuItemPriv } from '../MenuItem.priv'
import { TextPriv } from '../Text.priv'

export const MenuItem = (props: MenuItemProps) => {
	const colors = useThemeColor()
	return (
		<MenuItemPriv onPress={props.onPress} testID={props.testID}>
			<TextPriv>{props.children}</TextPriv>
			<Icon name='arrow-ios-forward' width={20} height={20} fill={colors['main-text']} />
		</MenuItemPriv>
	)
}
