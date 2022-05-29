import React from 'react'

import { IconWrapperLeftPriv } from '../icon-button/IconWrapperLeft.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { ErrorButtonPriv } from './ErrorButton.priv'
import { ErrorTextPriv } from './ErrorText.priv'

export const ErrorButtonIconLeft: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<ErrorButtonPriv {...props}>
			<IconWrapperLeftPriv disabled={!!props.disabled} name={props.name} type='error' />
			<ErrorTextPriv disabled={!!props.disabled}>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}
