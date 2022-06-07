import { StyleProp, ViewStyle, TextInputProps } from 'react-native'

export interface InputProps extends Omit<TextInputProps, 'style'> {}

export interface InputWithIconProps extends InputProps {
	iconName: string
}

export interface TouchableWrapperProps {
	style: StyleProp<ViewStyle>
	onPress?: () => void
}
