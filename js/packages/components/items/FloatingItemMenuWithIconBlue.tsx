import React from 'react'

import { useThemeColor } from '@berty/store'

import { FloatingItemMenuWithIconPriv } from './FloatingItemMenuWithIcon.priv'
import { ItemMenuWithIconProps } from './interfaces'

export const FloatingItemMenuWithIconBlue: React.FC<ItemMenuWithIconProps> = props => {
	const colors = useThemeColor()

	return <FloatingItemMenuWithIconPriv {...props} color={colors['background-header']} />
}
