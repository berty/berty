import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { ErrorButtonPriv } from './ErrorButton.priv'
import { ErrorTextPriv } from './ErrorText.priv'

export const ErrorButton: React.FC<ButtonDefProps> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}
