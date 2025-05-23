import React from 'react'
import { TouchableOpacity } from 'react-native'

import { TouchableWrapperProps } from '../interfaces'

export const TouchableWrapperPriv: React.FC<TouchableWrapperProps> = props => {
	return (
		<TouchableOpacity style={props.style} activeOpacity={1} onPress={props.onPress}>
			{props.children}
		</TouchableOpacity>
	)
}
