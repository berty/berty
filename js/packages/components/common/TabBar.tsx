import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, TransformsStyle } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'

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
	const [{ text, opacity, border }] = useStyles()
	return {
		tabItemName: text.size.small,
		tabItemDisable: opacity(0.2),
		tabBarItemEnable: [border.big, border.color.blue, border.radius.scale(2)],
		tabBarItemDisable: [border.big, border.color.black, border.radius.scale(2)],
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
	const [{ flex, color, text, padding }] = useStyles()
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
						fill={enable ? color.blue : color.black}
						name={icon}
						pack={iconPack}
						style={{ transform: iconTransform }}
						width={25}
						height={25}
					/>
				</View>
				<Text
					style={[
						text.bold.medium,
						text.align.center,
						_styles.tabItemName,
						enable ? text.color.blue : text.color.black,
					]}
				>
					{name}
				</Text>
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
	const [{ margin, row }] = useStyles()

	useEffect(() => {
		if (typeof onTabChange === 'function') {
			onTabChange(selectedTab)
		}
	}, [onTabChange, selectedTab, tabs])

	return (
		<View style={[margin.top.medium]}>
			<View style={[row.fill]}>
				{tabs &&
					tabs.map((obj) => (
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
					))}
			</View>
		</View>
	)
}
