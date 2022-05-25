import React from 'react'

import { InputWithIconProps } from '../interfaces'
import { TouchableWrapperWithIconPriv } from '../wrapper/TouchableWrapperWithIcon.priv'

export const LargeInput: React.FC<InputWithIconProps> = props => {
	return (
		<TouchableWrapperWithIconPriv
			value={props.value}
			onChange={props.onChange}
			placeholder={props.placeholder}
			iconName={props.iconName}
			iconColor='#AEAFC1'
			style={{
				backgroundColor: '#F7F8FE',
				borderRadius: 8,
				height: 54,
				paddingHorizontal: 16,
				paddingVertical: 17,
			}}
		/>
	)
}
