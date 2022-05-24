import React from 'react'

import { IconWrapperRightPriv } from '../icon-button/IconWrapperRight.priv'
import { ButtonDefProps, IconNameProps } from '../interfaces'
import { SecondaryButtonPriv } from './SecondaryButton.priv'
import { SecondaryTextPriv } from './SecondaryText.priv'

export const SecondaryButtonIconRight: React.FC<ButtonDefProps & IconNameProps> = props => {
	return (
		<SecondaryButtonPriv loading={props.loading} onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
			<IconWrapperRightPriv name={props.name} type='secondary' />
		</SecondaryButtonPriv>
	)
}
