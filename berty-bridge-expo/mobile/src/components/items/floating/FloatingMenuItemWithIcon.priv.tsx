import React from 'react'

import { MenuItemWithIconProps, PackProps } from '../interfaces'
import { MenuItemWithIconPriv } from '../section/MenuItemWithIcon.priv'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingMenuItemWithIconPriv: React.FC<
	MenuItemWithIconProps & PackProps & { color?: string }
> = props => {
	return (
		<FloatingContainerPriv>
			<MenuItemWithIconPriv {...props} />
		</FloatingContainerPriv>
	)
}
