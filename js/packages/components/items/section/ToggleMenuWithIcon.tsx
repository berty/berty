import React from 'react'

import { OnToggleMenuProps, ToggleItemMenuWithIconProps } from '../interfaces'
import { ToggleMenuWithIconPriv } from './ToggleMenuWithIcon.priv'

export const ToggleMenuWithIcon: React.FC<ToggleItemMenuWithIconProps & OnToggleMenuProps> =
	props => {
		return <ToggleMenuWithIconPriv {...props} />
	}
