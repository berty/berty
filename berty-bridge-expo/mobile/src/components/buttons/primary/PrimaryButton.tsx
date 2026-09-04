import React from 'react'

import { ButtonDefProps } from '../interfaces'
import { PrimaryButtonPriv } from './PrimaryButton.priv'
import { PrimaryTextPriv } from './PrimaryText.priv'

export const PrimaryButton: React.FC<React.PropsWithChildren<ButtonDefProps>> = props => {
	return (
		<PrimaryButtonPriv {...props}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}
