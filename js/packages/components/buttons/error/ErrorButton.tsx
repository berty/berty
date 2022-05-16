import React from 'react'

import { IButtonPress } from '../interfaces'
import ErrorButtonPriv from './ErrorButton.priv'
import ErrorTextPriv from './ErrorText.priv'

const ErrorButton: React.FC<IButtonPress> = props => {
	return (
		<ErrorButtonPriv onPress={props.onPress}>
			<ErrorTextPriv>{props.children}</ErrorTextPriv>
		</ErrorButtonPriv>
	)
}

export default ErrorButton
