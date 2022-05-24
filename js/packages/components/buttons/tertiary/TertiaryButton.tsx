import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryButton: React.FC<ButtonDefProps> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
