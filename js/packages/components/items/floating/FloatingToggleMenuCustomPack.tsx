import React from 'react'

import { ToggleItemMenuWithIconProps } from '../interfaces'
import { FloatingToggleMenuPriv } from './FloatingToggleMenu.priv'

export const FloatingToggleMenuCustomPack: React.FC<ToggleItemMenuWithIconProps> = props => {
	return <FloatingToggleMenuPriv {...props} pack='custom' backgroundColor='#F7F8FE' />
}
