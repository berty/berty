import React from 'react'

import { MenuItemProps } from '../interfaces'
import { MenuItem } from '../section/MenuItem'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingMenuItem: React.FC<MenuItemProps> = props => {
	return (
		<FloatingContainerPriv>
			<MenuItem {...props} />
		</FloatingContainerPriv>
	)
}
