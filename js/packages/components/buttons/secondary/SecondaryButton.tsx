import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryButton: React.FC<ButtonDefProps> = props => {
	return (
		<SecondaryButtonPriv {...props}>
			<SecondaryTextPriv disabled={!!props.disabled}>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}
