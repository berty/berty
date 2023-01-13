export interface MenuItemProps {
	onPress?: () => void
	testID?: string
	accessibilityLabel?: string
	noRightArrow?: boolean
}

export interface MenuItemWithIconProps extends MenuItemProps {
	iconName: string
}

export interface IsToggleProps {
	isToggleOn?: boolean | null
}

export interface ToggleMenuItemWithIconProps extends MenuItemWithIconProps, IsToggleProps {}

export interface OnToggleProps {
	onToggle?: () => void
}

export interface PackProps {
	pack?: string
}
