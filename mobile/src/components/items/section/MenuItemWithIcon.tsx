import React from 'react'

import { MenuItemWithIconProps } from '../interfaces'
import { MenuItemWithIconPriv } from './MenuItemWithIcon.priv'

export const MenuItemWithIcon: React.FC<MenuItemWithIconProps> = props => {
	return <MenuItemWithIconPriv {...props} />
}
