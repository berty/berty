import React from 'react'

import IconWrapperRightPriv from '../icon-button/IconWrapperRight.priv'
import { IButtonPress, IIconName } from '../interfaces'
import PrimaryButtonPriv from './PrimaryButton.priv'
import PrimaryTextPriv from './PrimaryText.priv'

const PrimaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
			<IconWrapperRightPriv name={props.name} />
		</PrimaryButtonPriv>
	)
}

export default PrimaryButtonIconRight
