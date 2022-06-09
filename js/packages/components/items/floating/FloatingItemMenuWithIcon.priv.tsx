import React from 'react'

import { ItemMenuWithIconProps, PackProps } from '../interfaces'
import { ItemMenuWithIconPriv } from '../section/ItemMenuWithIcon.priv'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingItemMenuWithIconPriv: React.FC<
	ItemMenuWithIconProps & PackProps & { color?: string }
> = props => {
	return (
		<FloatingContainerPriv>
			<ItemMenuWithIconPriv {...props} />
		</FloatingContainerPriv>
	)
}
