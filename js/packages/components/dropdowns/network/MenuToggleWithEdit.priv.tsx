import { Icon } from '@ui-kitten/components'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { Toggle } from '@berty/components'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { IsToggleProps, MenuItemProps, OnToggleProps } from '../../items/interfaces'
import { MenuItemPriv } from '../../items/MenuItem.priv'
import { TextPriv } from '../../items/Text.priv'

export const MenuToggleWithEditPriv: React.FC<
	MenuItemProps & OnToggleProps & IsToggleProps & { onPressModify?: () => void }
> = props => {
	const colors = useThemeColor()
	const { margin } = useStyles()

	return (
		<View style={margin.left.medium}>
			<MenuItemPriv onPress={props.onPress} testID={props.testID}>
				<TextPriv>{props.children}</TextPriv>
				{!!props.onPressModify && (
					<TouchableOpacity onPress={props.onPressModify} style={{ marginRight: 10 }}>
						<Icon name='edit-outline' width={20} height={20} fill={colors['background-header']} />
					</TouchableOpacity>
				)}
				<Toggle
					checked={props.isToggleOn ?? false}
					onChange={props.onToggle ? props.onToggle : props.onPress}
				/>
			</MenuItemPriv>
		</View>
	)
}
