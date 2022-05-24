import React from 'react'

import { useThemeColor } from '@berty/store'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const PrimaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
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
