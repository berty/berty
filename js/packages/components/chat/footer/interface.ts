import { TextInputProps } from 'react-native'

export interface ChatInputProps extends TextInputProps {
	handleTabletSubmit: () => void
	convPK: string
}
