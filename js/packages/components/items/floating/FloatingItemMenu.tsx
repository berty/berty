import React from 'react'

import { ItemMenuProps } from '../interfaces'
import { ItemMenu } from '../section/ItemMenu'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingItemMenu: React.FC<ItemMenuProps> = props => {
	return (
		<FloatingContainerPriv>
			<ItemMenu {...props} />
		</FloatingContainerPriv>
	)
}
