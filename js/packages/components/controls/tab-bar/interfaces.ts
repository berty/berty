import { TransformsStyle } from 'react-native'

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
	tabs: {
		key: string
		name: string
		icon: string
		buttonDisabled?: boolean
		iconPack?: string
		iconTransform?: TabBarItemProps['iconTransform']
	}[]
	onTabChange: (selectedTab: string) => void
}
