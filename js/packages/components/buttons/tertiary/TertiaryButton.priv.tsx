import React from 'react'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const TertiaryButtonPriv: React.FC<ButtonDefProps & { noBorder?: boolean }> = props => {
	// TODO: replace with value from theme
	return (
		<ButtonPriv borderColor={props.noBorder ? undefined : '#D2D3E1'} onPress={props.onPress}>
			{props.children}
		</ButtonPriv>
	)
}
