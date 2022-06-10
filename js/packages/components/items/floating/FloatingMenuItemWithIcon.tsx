import React from 'react'

import { MenuItemWithIconProps } from '../interfaces'
import { FloatingMenuItemWithIconPriv } from './FloatingMenuItemWithIcon.priv'

export const FloatingMenuItemWithIcon: React.FC<MenuItemWithIconProps> = props => {
	return <FloatingMenuItemWithIconPriv {...props} />
}
