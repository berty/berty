import React from 'react'

import { PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { MenuToggleWithIconPriv } from '../section/MenuToggleWithIcon.priv'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingMenuTogglePriv: React.FC<
	ToggleMenuItemWithIconProps & PackProps & { backgroundColor?: string }
> = props => {
	return (
		<FloatingContainerPriv backgroundColor={props.backgroundColor}>
			<MenuToggleWithIconPriv {...props} />
		</FloatingContainerPriv>
	)
}
