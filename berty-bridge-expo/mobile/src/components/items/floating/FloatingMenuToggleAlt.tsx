import React from 'react'

import { useThemeColor } from '@berty/hooks'

import { PackProps, ToggleMenuItemWithIconProps } from '../interfaces'
import { FloatingMenuTogglePriv } from './FloatingMenuToggle.priv'

export const FloatingMenuToggleAlt: React.FC<ToggleMenuItemWithIconProps & PackProps> = props => {
	const colors = useThemeColor()
	return <FloatingMenuTogglePriv {...props} backgroundColor={colors['input-background']} />
}
