import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useThemeColor } from '@berty/store'

import { useToggle } from './hooks/useToggle'
import { IconWithTextPriv } from './IconWithText.priv'
import { ItemMenuPriv } from './ItemMenu.priv'

interface ToggleMenuWithIconProps {
	onPress: () => void
	isToggleOn?: boolean
	iconName: string
	onToggle?: () => void
}

export const ToggleMenuWithIcon: React.FC<ToggleMenuWithIconProps> = props => {
	const isToggleOn = useToggle()
	const colors = useThemeColor()

	return (
		<ItemMenuPriv onPress={props.onPress}>
			<IconWithTextPriv iconName={props.iconName} color={colors['background-header']}>
				{props.children}
			</IconWithTextPriv>
			<Toggle
				status='primary'
				checked={isToggleOn}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</ItemMenuPriv>
	)
}
