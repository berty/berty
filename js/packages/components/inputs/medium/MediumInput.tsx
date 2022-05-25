import React from 'react'

import { InputWithIconProps } from '../interfaces'
import { MediumInputPriv } from './MediumInput.priv'

export const MediumInput: React.FC<InputWithIconProps> = props => {
	return (
		<MediumInputPriv
			value={props.value}
			onChange={props.onChange}
			placeholder={props.placeholder}
			backgroundColor='#F2F2F2'
			iconName={props.iconName}
		/>
	)
}
