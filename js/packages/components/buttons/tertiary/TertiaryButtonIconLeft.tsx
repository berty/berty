import React from 'react'

import IconWrapperLeftPriv from '../icon-button/IconWrapperLeft.priv'
import { IButtonPress, IIconName } from '../interfaces'
import TertiaryButtonPriv from './TertiaryButton.priv'
import TertiaryTextPriv from './TertiaryText.priv'

const TertiaryButtonIconLeft: React.FC<IButtonPress & IIconName> = props => {
	return (
		<TertiaryButtonPriv onPress={props.onPress}>
			<IconWrapperLeftPriv name={props.name} type='tertiary' />
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}

export default TertiaryButtonIconLeft
