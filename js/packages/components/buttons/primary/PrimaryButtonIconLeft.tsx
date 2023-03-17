import React from 'react'

import { IconWrapperLeftPriv } from '../icon-button/IconWrapperLeft.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { PrimaryButtonPriv } from './PrimaryButton.priv'
import { PrimaryTextPriv } from './PrimaryText.priv'

export const PrimaryButtonIconLeft: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<PrimaryButtonPriv {...props}>
			<IconWrapperLeftPriv disabled={!!props.disabled} name={props.name} />
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}
