import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { ErrorButtonPriv } from './ErrorButton.priv'
import { ErrorTextPriv } from './ErrorText.priv'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ErrorButton: React.FC<ButtonDefProps> = props => {
	return (
		<ErrorButtonPriv {...props}>
			<ErrorTextPriv disabled={!!props.disabled}>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}
