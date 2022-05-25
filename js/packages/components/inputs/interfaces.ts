import { StyleProp, ViewStyle } from 'react-native'

export interface InputProps {
	value?: string
	onChange: (text: string) => void
	placeholder?: string
	disabled?: boolean
}

export interface InputWithIconProps extends InputProps {
	iconName: string
}

export interface TouchableWrapperProps {
	style: StyleProp<ViewStyle>
	onPress?: () => void
}
