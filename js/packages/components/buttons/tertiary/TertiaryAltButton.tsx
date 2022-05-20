import React from 'react'

import { IButtonPress } from '../interfaces'
import TertiaryButtonPriv from './TertiaryButton.priv'
import TertiaryTextPriv from './TertiaryText.priv'

const TertiaryAltButton: React.FC<IButtonPress> = props => {
	return (
		<TertiaryButtonPriv noBorder onPress={props.onPress}>
			<TertiaryTextPriv>{props.children}</TertiaryTextPriv>
		</TertiaryButtonPriv>
	)
}

export default TertiaryAltButton
