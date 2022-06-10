import React from 'react'

import { useThemeColor } from '@berty/store'

import { MenuItemWithIconProps, PackProps } from '../interfaces'
import { FloatingMenuItemWithIconPriv } from './FloatingMenuItemWithIcon.priv'

export const FloatingMenuItemWithPrimaryIcon: React.FC<MenuItemWithIconProps & PackProps> =
	props => {
		const colors = useThemeColor()

		return <FloatingMenuItemWithIconPriv {...props} color={colors['background-header']} />
	}
