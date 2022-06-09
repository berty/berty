import React from 'react'

import { FloatingToggleMenuPriv } from './FloatingToggleMenu.priv'
import { ToggleItemMenuWithIconProps } from './interfaces'

export const FloatingToggleMenuCustomPack: React.FC<ToggleItemMenuWithIconProps> = props => {
	return <FloatingToggleMenuPriv {...props} pack='custom' />
}
