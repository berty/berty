import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { ErrorButtonPriv } from './ErrorButton.priv'
import { ErrorTextPriv } from './ErrorText.priv'

export const ErrorButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<ErrorButtonPriv {...props}>
			<ErrorTextPriv disabled={!!props.disabled}>{props.children}</ErrorTextPriv>
			<IconWrapperRightPriv disabled={!!props.disabled} name={props.name} type='error' />
		</ErrorButtonPriv>
	)
}
