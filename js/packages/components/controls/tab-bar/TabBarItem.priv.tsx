import { Icon } from '@ui-kitten/components'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { TabBarItemProps } from './interfaces'

const useStylesTab = () => {
	const { text, opacity, border } = useStyles()
	const colors = useThemeColor()

	return {
		tabItemName: text.size.small,
		tabItemDisable: opacity(0.2),
		tabBarItemEnable: [
			border.big,
			border.radius.scale(2),
			{ borderColor: colors['background-header'] },
		],
		tabBarItemDisable: [border.big, border.radius.scale(2), { borderColor: colors['main-text'] }],
	}
}

export const TabBarItemPriv: React.FC<TabBarItemProps> = ({
	name,
	icon,
	iconPack,
	iconTransform,
	setEnable,
	enable = false,
	buttonDisabled = false,
}) => {
	const _styles = useStylesTab()
	const { flex, text, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			onPress={() => setEnable(name)}
			accessibilityLabel={name}
			style={[flex.tiny, padding.bottom.tiny]}
			disabled={buttonDisabled}
		>
			<View
				style={[
					!enable && _styles.tabItemDisable,
					{
						alignItems: 'center',
						justifyContent: 'space-between',
					},
				]}
			>
				<View style={{ height: 25 }}>
					<Icon
						fill={enable ? colors['background-header'] : colors['main-text']}
						name={icon}
						pack={iconPack}
						style={{ transform: iconTransform }}
						width={25}
						height={25}
					/>
				</View>
				<UnifiedText
					style={[
						text.bold,
						text.align.center,
						_styles.tabItemName,
						{ color: enable ? colors['background-header'] : colors['main-text'] },
					]}
				>
					{name}
				</UnifiedText>
			</View>
			<View
				style={[
					{ width: '95%', position: 'absolute', bottom: 0, left: '2.5%' },
					enable ? _styles.tabBarItemEnable : _styles.tabBarItemDisable,
					!enable && _styles.tabItemDisable,
				]}
			/>
		</TouchableOpacity>
	)
}
