import React from 'react'

import { Toggle } from '@berty/components/shared-components/Toggle'
import { useThemeColor } from '@berty/store'

import { IconWithTextPriv } from './IconWithText.priv'
import { OnToggleMenuProps, ToggleItemMenuWithIconProps } from './interfaces'
import { ItemMenuPriv } from './ItemMenu.priv'

export const ToggleMenuWithIcon: React.FC<ToggleItemMenuWithIconProps & OnToggleMenuProps> =
	props => {
		const colors = useThemeColor()

		return (
			<ItemMenuPriv onPress={props.onPress}>
				<IconWithTextPriv iconName={props.iconName} color={colors['background-header']}>
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
