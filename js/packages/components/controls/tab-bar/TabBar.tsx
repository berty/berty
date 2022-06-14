import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

import { TabBarProps } from './interfaces'
import { TabBarItemPriv } from './TabBarItem.priv'

export const TabBar: React.FC<TabBarProps> = ({ tabs, onTabChange }) => {
	const [selectedTab, setEnable] = useState(tabs[0].key)
	const { margin, row } = useStyles()

	useEffect(() => {
		onTabChange(selectedTab)
	}, [onTabChange, selectedTab, tabs])

	return (
		<View style={[margin.top.medium]}>
			<View style={[row.fill]}>
				{tabs.map(obj => (
					<TabBarItemPriv
						key={obj.key}
						name={obj.name}
						icon={obj.icon}
						iconPack={obj.iconPack}
						iconTransform={obj.iconTransform}
						setEnable={() => setEnable(obj.key)}
						enable={selectedTab === obj.key}
						buttonDisabled={obj.buttonDisabled || false}
					/>
				))}
			</View>
		</View>
	)
}
