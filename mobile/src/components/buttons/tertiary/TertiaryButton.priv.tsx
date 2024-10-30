import React from 'react'
import { ActivityIndicator, ViewStyle } from 'react-native'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const TertiaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
	// TODO: replace with value from theme
	const getStyle = (): ViewStyle | undefined => {
		if (props.disabled) {
			if (!props.alternative) {
				return { backgroundColor: '#F3F3F8' }
			}
		}
		if (!props.alternative) {
			return { borderColor: '#D2D3E1', borderWidth: 1 }
		}
		return undefined
	}

	return (
		<ButtonPriv {...props} style={getStyle()} onPress={props.loading ? undefined : props.onPress}>
			{props.loading ? <ActivityIndicator color='#D2D3E1' /> : props.children}
		</ButtonPriv>
	)
}
