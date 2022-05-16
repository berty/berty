import React from 'react'

import { IButtonPress } from '../interfaces'
import SecondaryButtonPriv from './SecondaryButton.priv'
import SecondaryTextPriv from './SecondaryText.priv'

const SecondaryButton: React.FC<IButtonPress> = props => {
	return (
		<SecondaryButtonPriv onPress={props.onPress}>
			<SecondaryTextPriv>{props.children}</SecondaryTextPriv>
		</SecondaryButtonPriv>
	)
}

export default SecondaryButton
