import React from 'react'

import { FloatingItemMenuWithIconPriv } from './FloatingItemMenuWithIcon.priv'
import { ItemMenuWithIconProps } from './interfaces'

export const FloatingItemMenuWithIcon: React.FC<ItemMenuWithIconProps> = props => {
	return <FloatingItemMenuWithIconPriv {...props} />
}
