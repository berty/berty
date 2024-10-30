import React from 'react'
import { ActivityIndicator } from 'react-native'

import { useThemeColor } from '@berty/hooks'

import { ButtonPriv } from '../Button.priv'
import { ButtonDefProps } from '../interfaces'

export const SecondaryButtonPriv: React.FC<ButtonDefProps & { alternative?: boolean }> = props => {
	const colors = useThemeColor()

	// TODO: replace with value from theme
	const getBgColor = (): string => {
		if (props.disabled) {
			return '#F3F3F8'
		}
		return '#EAEAFB'
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
			{props.loading ? <ActivityIndicator color={colors['background-header']} /> : props.children}
		</ButtonPriv>
	)
}
