import { StyleProp, ViewStyle } from 'react-native'

export interface InputProps {
	value?: string
	onChangeText?: (text: string) => void
	placeholder?: string
	accessibilityLabel?: string
	editable?: boolean
}

export interface InputWithIconProps extends InputProps {
	iconName: string
}

export interface TouchableWrapperProps {
	style: StyleProp<ViewStyle>
	onPress?: () => void
}
