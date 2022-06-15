import { TFunction } from 'i18next'
import { TransformsStyle } from 'react-native'

export interface Tabs {
	name: Parameters<TFunction>[0]
	buttonDisabled?: boolean
}

export interface TabBarItemProps {
	name: string
	icon: string
	setEnable: (name: string) => void
	enable?: boolean
	buttonDisabled?: boolean
	iconPack?: string
	iconTransform?: TransformsStyle['transform']
}

export interface TabBarProps {
	tabs: Tabs[]
	onTabChange: (selectedTab: string) => void
}
