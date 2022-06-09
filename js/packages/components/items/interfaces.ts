export interface ItemMenuProps {
	onPress?: () => void
}

export interface ItemMenuWithIconProps extends ItemMenuProps {
	iconName: string
}

export interface IsToggleProps {
	isToggleOn?: boolean | null
}

export interface ToggleItemMenuWithIconProps extends ItemMenuWithIconProps, IsToggleProps {}

export interface OnToggleMenuProps {
	onToggle?: () => void
}
