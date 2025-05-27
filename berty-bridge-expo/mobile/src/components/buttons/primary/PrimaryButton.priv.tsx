import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const PrimaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
	const colors = useThemeColor()

	let backgroundColor = colors['background-header']

	// TODO: replace with value from theme
	if (props.disabled) {
		backgroundColor = props.alternative ? '#E3E4EB' : '#E9EAF1'
	} else if (props.alternative) {
		backgroundColor = '#3943D4'
	}

	return (
		<ButtonPriv
			{...props}
			style={{
				borderRadius: props.alternative ? 14 : 8,
				backgroundColor,
			}}
			onPress={props.loading ? undefined : props.onPress}
		>
			{props.loading ? <ActivityIndicator color='#F2F2F2' /> : props.children}
		</ButtonPriv>
	)
}
