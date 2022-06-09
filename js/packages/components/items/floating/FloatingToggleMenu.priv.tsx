import React from 'react'

import { PackProps, ToggleItemMenuWithIconProps } from '../interfaces'
import { ToggleMenuWithIconPriv } from '../section/ToggleMenuWithIcon.priv'
import { FloatingContainerPriv } from './FloatingContainer.priv'

export const FloatingToggleMenuPriv: React.FC<
	ToggleItemMenuWithIconProps & PackProps & { backgroundColor?: string }
> = props => {
	return (
		<FloatingContainerPriv backgroundColor={props.backgroundColor}>
			<ToggleMenuWithIconPriv {...props} />
		</FloatingContainerPriv>
	)
}
