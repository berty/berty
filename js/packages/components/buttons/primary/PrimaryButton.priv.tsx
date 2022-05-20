import React from 'react'

import { useThemeColor } from '@berty/store'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const PrimaryButtonPriv: React.FC<IButtonPress & { alternative?: boolean }> = props => {
	const colors = useThemeColor()

	// TODO: replace with value from theme
	return (
		<ButtonPriv
			borderRadius={props.alternative ? 14 : undefined}
			backgroundColor={props.alternative ? '#3943D4' : colors['background-header']}
			onPress={props.onPress}
		>
			{props.children}
		</ButtonPriv>
	)
}

export default PrimaryButtonPriv
