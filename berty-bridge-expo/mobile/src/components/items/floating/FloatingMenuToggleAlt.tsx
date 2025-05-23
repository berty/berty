import React from 'react'

import { PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { FloatingMenuTogglePriv } from './FloatingMenuToggle.priv'

export const FloatingMenuToggleAlt: React.FC<ToggleMenuItemWithIconProps & PackProps> = props => {
	return <FloatingMenuTogglePriv {...props} backgroundColor='#F7F8FE' />
}
