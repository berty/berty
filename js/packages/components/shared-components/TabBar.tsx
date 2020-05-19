import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'

// Types
type TabItemProps = {
	name: string
	icon: string
	setEnable: React.Dispatch<React.SetStateAction<any>>
	enable?: boolean
	buttonDisabled?: boolean
	style?: any
}

type TabBarProps = {
	tabs: { name: string; icon: string; buttonDisabled?: boolean; style?: any }[]
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
	const [{ flex, color, text }] = useStyles()
	return (
		<TouchableOpacity
			onPress={() => setEnable(name)}
			style={[flex.tiny, style]}
			disabled={buttonDisabled}
		>
			<View style={[!enable && _styles.tabItemDisable, { alignItems: 'center' }]}>
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
						_styles.tabItemName,
						enable ? text.color.blue : text.color.black,
					]}
				>
					{name}
				</Text>
				<View
					style={[{ width: '95%' }, enable ? _styles.tabBarItemEnable : _styles.tabBarItemDisable]}
				/>
			</View>
		</TouchableOpacity>
	)
}

// TabBarList
export const TabBar: React.FC<TabBarProps> = ({ tabs, onTabChange }) => {
	const [selectedTab, setEnable] = useState(tabs[0].name)
	const [{ margin, row }] = useStyles()

	useEffect(() => {
		if (typeof onTabChange === 'function') {
			onTabChange(selectedTab)
		}
	}, [onTabChange, selectedTab])

	return (
		<View style={[margin.top.medium]}>
			<View style={[row.fill]}>
				{tabs &&
					tabs.map((obj) => (
						<TabBarItem
							name={obj.name}
							icon={obj.icon}
							iconPack={obj.iconPack}
							iconTransform={obj.iconTransform}
							setEnable={setEnable}
							enable={selectedTab === obj.name}
							buttonDisabled={obj.buttonDisabled || false}
							style={obj.style}
						/>
					))}
			</View>
		</View>
	)
}
