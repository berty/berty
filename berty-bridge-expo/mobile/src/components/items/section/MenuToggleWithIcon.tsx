import React from 'react'

import { OnToggleProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { MenuToggleWithIconPriv } from './MenuToggleWithIcon.priv'

export const MenuToggleWithIcon: React.FC<ToggleMenuItemWithIconProps & OnToggleProps> = props => {
	return <MenuToggleWithIconPriv {...props} />
}
