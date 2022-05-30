import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<SecondaryButtonPriv {...props}>
			<SecondaryTextPriv disabled={!!props.disabled}>{props.children}</SecondaryTextPriv>
			<IconWrapperRightPriv disabled={!!props.disabled} name={props.name} type='secondary' />
		</SecondaryButtonPriv>
	)
}
