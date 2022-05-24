import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { ErrorButtonPriv } from './ErrorButton.priv'
import { ErrorTextPriv } from './ErrorText.priv'

export const ErrorButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
			<IconWrapperRightPriv name={props.name} type='error' />
		</ErrorButtonPriv>
	)
}
