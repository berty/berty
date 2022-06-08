import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'

import { useToggle } from './hooks/useToggle'
import { ItemMenuPriv } from './ItemMenu.priv'
import { TextPriv } from './Text.priv'

interface ToggleMenuProps {
	onPress: () => void
	isToggleOn?: boolean | null
	onToggle?: () => void
}

export const ToggleMenu: React.FC<ToggleMenuProps> = props => {
	const isToggleOn = useToggle()

	return (
		<ItemMenuPriv onPress={props.onPress}>
			<TextPriv>{props.children}</TextPriv>
			<Toggle
				status='primary'
				checked={isToggleOn}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</ItemMenuPriv>
	)
}
