import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from '../IconWithText.priv'
import { OnToggleMenuProps, PackProps, ToggleItemMenuWithIconProps } from '../interfaces'
import { ItemMenuPriv } from '../ItemMenu.priv'

export const ToggleMenuWithIconPriv: React.FC<
	ToggleItemMenuWithIconProps & OnToggleMenuProps & PackProps
> = props => {
	const colors = useThemeColor()

	return (
		<ItemMenuPriv onPress={props.onPress}>
			<IconWithTextPriv
				iconName={props.iconName}
				pack={props.pack}
				color={colors['background-header']}
			>
				{props.children}
			</IconWithTextPriv>
			<Toggle
				status='primary'
				checked={props.isToggleOn ?? false}
				onChange={props.onToggle ? props.onToggle : props.onPress}
			/>
		</ItemMenuPriv>
	)
}
