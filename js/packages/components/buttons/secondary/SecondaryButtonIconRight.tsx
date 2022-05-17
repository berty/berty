import React from 'react'

import IconWrapperRightPriv from '../icon-button/IconWrapperRight.priv'
import { IButtonPress, IIconName } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<SecondaryButtonPriv loading={props.loading} onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
			<IconWrapperRightPriv name={props.name} type='secondary' />
		</SecondaryButtonPriv>
	)
}

export default SecondaryButtonIconRight
