import React from 'react'

import { IButtonPress } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryAltButton: React.FC<IButtonPress> = props => {
	return (
		<SecondaryButtonPriv alternative onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}

export default SecondaryAltButton
