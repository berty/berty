import React from 'react'
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native'

interface InputPrivProps {
	style: StyleProp<ViewStyle>
	onPress?: () => void
}

export const TouchableWrapperPriv: React.FC<InputPrivProps> = props => {
	return (
		<TouchableOpacity style={props.style} activeOpacity={1} onPress={props.onPress}>
			{props.children}
		</TouchableOpacity>
	)
}
