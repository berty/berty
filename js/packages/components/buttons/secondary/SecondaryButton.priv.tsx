import React from 'react'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const SecondaryButtonPriv: React.FC<IButtonPress & { alternative?: boolean }> = props => {
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

export default SecondaryButtonPriv
