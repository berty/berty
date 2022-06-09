import React from 'react'

import { ItemMenuWithIconProps } from '../interfaces'
import { ItemMenuWithIconPriv } from './ItemMenuWithIcon.priv'

export const ItemMenuWithIcon: React.FC<ItemMenuWithIconProps> = props => {
	return <ItemMenuWithIconPriv {...props} />
}
