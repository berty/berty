import { TextInputProps } from 'react-native'

export interface ChatInputProps extends TextInputProps {
	handleTabletSubmit: () => void
	onFocusChange: (val: boolean) => void
	convPK: string
}
