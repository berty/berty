import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryAltButton: React.FC<ButtonDefProps> = props => {
	return (
		<SecondaryButtonPriv alternative onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}
