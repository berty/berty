import React from 'react'

import IconWrapperLeftPriv from '../icon-button/IconWrapperLeft.priv'
import { IButtonPress, IIconName } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<SecondaryButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} type='secondary' />
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}

export default SecondaryButtonIconLeft
