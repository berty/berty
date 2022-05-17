import React from 'react'

import IconWrapperLeftPriv from '../icon-button/IconWrapperLeft.priv'
import { IButtonPress, IIconName } from '../interfaces'
import PrimaryButtonPriv from './PrimaryButton.priv'
import PrimaryTextPriv from './PrimaryText.priv'

const PrimaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} />
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}

export default PrimaryButtonIconLeft
