import React, { useState, useEffect } from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { styles, colors } from '@berty-tech/styles'

// Types
type TabItemProps = {
	name: string
	icon: string
	setEnable: React.Dispatch<React.SetStateAction<any>>
	enable?: boolean
	buttonDisabled?: boolean
}

type TabBarProps = {
	tabType: string
}

// Styles
const _tabStyles = StyleSheet.create({
	// TabItemStyles
	tabItemName: {
		fontSize: 12,
	},
	tabItemDisable: {
		opacity: 0.2,
	},
	tabBarItemEnable: {
		width: '95%',
		borderWidth: 2,
		borderColor: colors.blue,
		borderRadius: 2,
	},
	tabBarItemDisable: {
		width: '95%',
		borderWidth: 2,
		borderColor: colors.black,
		borderRadius: 2,
	},
})

//
// TabBar
//

// TabBarItem
const TabBarItem: React.FC<TabItemProps> = ({
	name,
	icon,
	setEnable,
	enable = false,
	buttonDisabled = false,
}) => (
	<TouchableOpacity onPress={() => setEnable(name)} style={[styles.flex]} disabled={buttonDisabled}>
		<View style={[styles.centerItems, !enable && _tabStyles.tabItemDisable]}>
			<Icon fill={enable ? colors.blue : colors.black} name={icon} width={25} height={25} />
			<Text
				style={[
					styles.fontFamily,
					styles.textBold,
					_tabStyles.tabItemName,
					enable ? styles.textBlue : styles.textBlack,
				]}
			>
				{name}
			</Text>
			<View style={[enable ? _tabStyles.tabBarItemEnable : _tabStyles.tabBarItemDisable]} />
		</View>
	</TouchableOpacity>
)

// TabBarList
export const TabBar: React.FC<TabBarProps> = ({ tabType }) => {
	const [tabs, setTabs] = useState()
	const [enable, setEnable] = useState('Fingerprint')

	useEffect(() => {
		if (!tabs) {
			if (tabType === 'contact') {
				setTabs([
					{ name: 'Fingerprint', icon: 'code-outline' },
					{ name: 'Infos', icon: 'info-outline' },
					{ name: 'Devices', icon: 'smartphone-outline' },
				])
			} else if (tabType === 'group') {
				setTabs([
					{ name: 'Members', icon: 'people-outline' },
					{ name: 'Fingerprint', icon: 'code-outline' },
					{ name: 'Infos', icon: 'info-outline' },
				])
			}
		}
	}, [tabs, tabType])

	return (
		<View style={[styles.marginTop]}>
			<View style={[styles.row, styles.spaceEvenly]}>
				{tabs &&
					tabs.map((obj: any) => (
						<TabBarItem
							name={obj.name}
							icon={obj.icon}
							setEnable={setEnable}
							enable={enable === obj.name}
						/>
					))}
			</View>
		</View>
	)
}
