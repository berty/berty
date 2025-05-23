import React from 'react'

import { PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { FloatingMenuTogglePriv } from './FloatingMenuToggle.priv'

export const FloatingMenuToggle: React.FC<ToggleMenuItemWithIconProps & PackProps> = props => {
	return <FloatingMenuTogglePriv {...props} />
}
