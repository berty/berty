import React from 'react'

import { FloatingToggleMenuPriv } from './FloatingToggleMenu.priv'
import { ToggleItemMenuWithIconProps } from './interfaces'

export const FloatingWhiteToggleMenu: React.FC<ToggleItemMenuWithIconProps> = props => {
	return <FloatingToggleMenuPriv {...props} backgroundColor='white' />
}
