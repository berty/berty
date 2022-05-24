import React from 'react'

import { IconWrapperLeftPriv } from '../icon-button/IconWrapperLeft.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { TertiaryButtonPriv } from './TertiaryButton.priv'
import { TertiaryTextPriv } from './TertiaryText.priv'

export const TertiaryButtonIconLeft: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} type='tertiary' />
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}
