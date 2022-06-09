import React from 'react'

import { ToggleItemMenuWithIconProps } from '../interfaces'
import { FloatingToggleMenuPriv } from './FloatingToggleMenu.priv'

export const FloatingToggleMenu: React.FC<ToggleItemMenuWithIconProps> = props => {
	return <FloatingToggleMenuPriv {...props} />
}
