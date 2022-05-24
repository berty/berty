import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryButton: React.FC<ButtonDefProps> = props => {
	return (
		<SecondaryButtonPriv onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}
