import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryButton: React.FC<ButtonDefProps> = props => {
	return (
		<TertiaryButtonPriv {...props}>
			<TertiaryTextPriv disabled={!!props.disabled}>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
