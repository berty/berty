import React from 'react'

import { IconWrapperLeftPriv } from '../icon-button/IconWrapperLeft.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryButtonIconLeft: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<TertiaryButtonPriv {...props}>
			<IconWrapperLeftPriv disabled={!!props.disabled} name={props.name} type='tertiary' />
			<TertiaryTextPriv disabled={!!props.disabled}>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
