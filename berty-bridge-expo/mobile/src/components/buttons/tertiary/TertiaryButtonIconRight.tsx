import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<TertiaryButtonPriv {...props}>
			<TertiaryTextPriv disabled={!!props.disabled}>{props.children}</TertiaryTextPriv>
			<IconWrapperRightPriv disabled={!!props.disabled} name={props.name} type='tertiary' />
		</TertiaryButtonPriv>
	)
}
