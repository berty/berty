import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, TransformsStyle } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'
import { UnifiedText } from './UnifiedText'

// Types
type TabItemProps = {
	name: string
	icon: string
	setEnable: React.Dispatch<React.SetStateAction<any>>
	enable?: boolean
	buttonDisabled?: boolean
	style?: any
	iconPack?: string
	iconTransform?: TransformsStyle['transform']
}

type TabBarProps = {
	tabs: {
		key: string
		name: string
		icon: string
		buttonDisabled?: boolean
		style?: any
		iconPack?: string
		iconTransform?: TabItemProps['iconTransform']
	}[]
	onTabChange: any
}

// Styles
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

//
// TabBar
//

// TabBarItem
const TabBarItem: React.FC<TabItemProps> = ({
	name,
	icon,
	iconPack,
	iconTransform,
	setEnable,
	enable = false,
	style = null,
	buttonDisabled = false,
}) => {
	const _styles = useStylesTab()
	const { flex, text, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			onPress={() => setEnable(name)}
			style={[flex.tiny, style, padding.bottom.tiny]}
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

// TabBarList
export const TabBar: React.FC<TabBarProps> = ({ tabs, onTabChange }) => {
	const [selectedTab, setEnable] = useState(tabs[0].key)
	const { margin, row } = useStyles()

	useEffect(() => {
		if (typeof onTabChange === 'function') {
			onTabChange(selectedTab)
		}
	}, [onTabChange, selectedTab, tabs])

	return (
		<View style={[margin.top.medium]}>
			<View style={[row.fill]}>
				{tabs
					? tabs.map(obj => (
							<TabBarItem
								key={obj.key}
								name={obj.name}
								icon={obj.icon}
								iconPack={obj.iconPack}
								iconTransform={obj.iconTransform}
								setEnable={() => setEnable(obj.key)}
								enable={selectedTab === obj.key}
								buttonDisabled={obj.buttonDisabled || false}
								style={obj.style}
							/>
					  ))
					: null}
			</View>
		</View>
	)
}
