import React from 'react'

import { ItemMenuWithIconProps } from '../interfaces'
import { FloatingItemMenuWithIconPriv } from './FloatingItemMenuWithIcon.priv'

export const FloatingItemMenuWithIcon: React.FC<ItemMenuWithIconProps> = props => {
	return <FloatingItemMenuWithIconPriv {...props} />
}
