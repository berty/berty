import React from 'react'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const ErrorButtonPriv: React.FC<IButtonPress> = props => {
	// TODO: replace with value from theme
	return (
		<ButtonPriv borderColor='#E35179' onPress={props.onPress}>
			{props.children}
		</ButtonPriv>
	)
}

export default ErrorButtonPriv
