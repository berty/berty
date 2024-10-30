import React from 'react'

import { TextButtonPriv } from '../TextButton.priv'

export const ErrorTextPriv: React.FC<{ disabled: boolean }> = props => {
	// TODO: replace with value from theme
	return (
		<TextButtonPriv color={props.disabled ? '#D0D0D6' : '#E35179'}>{props.children}</TextButtonPriv>
	)
}
