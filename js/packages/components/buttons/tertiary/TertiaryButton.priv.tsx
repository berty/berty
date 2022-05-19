import React from 'react'

import ButtonPriv from '../Button.priv'
import { IButtonPress } from '../interfaces'

const TertiaryButtonPriv: React.FC<IButtonPress & { noBorder?: boolean }> = props => {
	// TODO: replace with value from theme
	return (
		<ButtonPriv borderColor={props.noBorder ? undefined : '#D2D3E1'} onPress={props.onPress}>
			{props.children}
		</ButtonPriv>
	)
}

export default TertiaryButtonPriv
