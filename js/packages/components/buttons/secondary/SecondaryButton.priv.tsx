import React from 'react'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const SecondaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
	// TODO: replace with value from theme
	return (
		<ButtonPriv
			loading={props.loading}
			borderRadius={props.alternative ? 14 : undefined}
			backgroundColor='#EAEAFB'
			onPress={props.onPress}
		>
			{props.children}
		</ButtonPriv>
	)
}
