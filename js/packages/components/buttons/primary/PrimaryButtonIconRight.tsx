import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { PrimaryButtonPriv } from './PrimaryButton.priv'
import { PrimaryTextPriv } from './PrimaryText.priv'

export const PrimaryButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
			<IconWrapperRightPriv name={props.name} />
		</PrimaryButtonPriv>
	)
}
