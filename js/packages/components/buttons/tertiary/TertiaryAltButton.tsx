import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryAltButton: React.FC<ButtonDefProps> = props => {
	return (
		<TertiaryButtonPriv noBorder onPress={props.onPress}>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
