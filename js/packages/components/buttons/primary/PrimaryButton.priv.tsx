import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useThemeColor } from '@berty/store'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const PrimaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
	const colors = useThemeColor()

	// TODO: replace with value from theme
	const getBgColor = (): string => {
		if (props.disabled) {
			return props.alternative ? '#E3E4EB' : '#E9EAF1'
		}
		return props.alternative ? '#3943D4' : colors['background-header']
	}

	return (
		<ButtonPriv
			{...props}
			style={{
				borderRadius: props.alternative ? 14 : 8,
				backgroundColor: getBgColor(),
			}}
			onPress={props.loading ? undefined : props.onPress}
		>
			{props.loading ? <ActivityIndicator color='#F2F2F2' /> : props.children}
		</ButtonPriv>
	)
}
