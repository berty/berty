import React from 'react'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const ErrorButtonPriv: React.FC<ButtonDefProps> = props => {
	// TODO: replace with value from theme
	return (
		<ButtonPriv borderColor='#E35179' onPress={props.onPress}>
			{props.children}
		</ButtonPriv>
	)
}
