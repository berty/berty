import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { PrimaryButtonPriv } from './PrimaryButton.priv'
import { PrimaryTextPriv } from './PrimaryText.priv'

export const PrimaryAltButton: React.FC<ButtonDefProps> = props => {
	return (
		<PrimaryButtonPriv alternative onPress={props.onPress}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}
