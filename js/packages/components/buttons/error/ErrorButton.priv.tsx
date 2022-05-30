import React from 'react'
import { ActivityIndicator, ViewStyle } from 'react-native'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const ErrorButtonPriv: React.FC<ButtonDefProps> = props => {
	// TODO: replace with value from theme
	const getStyle = (): ViewStyle => {
		if (props.disabled) {
			return { backgroundColor: '#F3F3F8' }
		}
		return { borderColor: '#E35179', borderWidth: 1 }
	}
	return (
		<ButtonPriv {...props} style={getStyle()} onPress={props.loading ? undefined : props.onPress}>
			{props.loading ? <ActivityIndicator color='#E35179' /> : props.children}
		</ButtonPriv>
	)
}
