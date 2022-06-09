import React from 'react'

import { useThemeColor } from '@berty/store'

import { ItemMenuWithIconProps } from '../interfaces'
import { FloatingItemMenuWithIconPriv } from './FloatingItemMenuWithIcon.priv'

export const FloatingItemMenuWithIconBlueCustomPack: React.FC<ItemMenuWithIconProps> = props => {
	const colors = useThemeColor()

	return (
		<FloatingItemMenuWithIconPriv {...props} color={colors['background-header']} pack='custom' />
	)
}
