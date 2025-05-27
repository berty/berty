import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryAltButton: React.FC<ButtonDefProps> = props => {
	return (
		<TertiaryButtonPriv {...props} alternative>
			<TertiaryTextPriv disabled={!!props.disabled} alternative>
				{props.children}
			</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
