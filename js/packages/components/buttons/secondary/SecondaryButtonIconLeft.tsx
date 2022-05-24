import React from 'react'

import { IconWrapperLeftPriv } from '../icon-button/IconWrapperLeft.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryButtonIconLeft: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<SecondaryButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} type='secondary' />
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}
