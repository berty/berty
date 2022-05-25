import React from 'react'

import { InputWithIconProps } from '../interfaces'
import { MediumInputPriv } from './MediumInput.priv'

export const MediumAltInput: React.FC<InputWithIconProps> = props => {
	return (
		<MediumInputPriv
			value={props.value}
			onChange={props.onChange}
			placeholder={props.placeholder}
			backgroundColor='#F7F8FE'
			iconName={props.iconName}
		/>
	)
}
