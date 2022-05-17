import React from 'react'

import IconWrapperRightPriv from '../icon-button/IconWrapperRight.priv'
import { IButtonPress, IIconName } from '../interfaces'
import TertiaryButtonPriv from './TertiaryButton.priv'
import TertiaryTextPriv from './TertiaryText.priv'

const TertiaryButtonIconRight: React.FC<IButtonPress & IIconName> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
			<IconWrapperRightPriv name={props.name} type='tertiary' />
		</TertiaryButtonPriv>
	)
}

export default TertiaryButtonIconRight
