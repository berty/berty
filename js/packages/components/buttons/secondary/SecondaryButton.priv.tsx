import React from 'react'

import { useThemeColor } from '@berty/store'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const SecondaryButtonPriv: React.FC<IButtonPress> = props => {
	const colors = useThemeColor()

	return (
		<ButtonPriv
			loading={props.loading}
			backgroundColor={`${colors['background-header']}20`}
			onPress={props.onPress}
		>
			{props.children}
		</ButtonPriv>
	)
}

export default SecondaryButtonPriv
