export interface InputProps {
	value: string
	onChange: (text: string) => void
	placeholder?: string
}

export interface InputWithIconProps extends InputProps {
	iconName: string
}
