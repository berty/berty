import React from 'react'

import { useThemeColor } from '@berty/store'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const PrimaryButtonPriv: React.FC<IButtonPress> = props => {
	const colors = useThemeColor()

	return (
		<ButtonPriv backgroundColor={colors['background-header']} onPress={props.onPress}>
			{props.children}
		</ButtonPriv>
	)
}

export default PrimaryButtonPriv
