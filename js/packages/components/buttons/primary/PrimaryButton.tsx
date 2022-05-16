import React from 'react'

import { IButtonPress } from '../interfaces'
import PrimaryButtonPriv from './PrimaryButton.priv'
import PrimaryTextPriv from './PrimaryText.priv'

const PrimaryButton: React.FC<IButtonPress> = props => {
	return (
		<PrimaryButtonPriv onPress={props.onPress}>
			<PrimaryTextPriv>{props.children}</PrimaryTextPriv>
		</PrimaryButtonPriv>
	)
}

export default PrimaryButton
