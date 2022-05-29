import { StyleProp, TextInputProps, ViewStyle } from 'react-native'

export interface InputWithIconProps extends Omit<TextInputProps, 'style'> {
	iconName: string
}

export interface TouchableWrapperProps {
	style: StyleProp<ViewStyle>
	onPress?: () => void
}
