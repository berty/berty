import { TouchableOpacityProps } from 'react-native'

export interface ButtonDefProps extends Omit<TouchableOpacityProps, 'style'> {
	loading?: boolean
}

export interface IconNameProps {
	// TODO: check how to use this with a type
	/**
	 * @default 'checkmark-outline'
	 */
	name?: string
}

export interface IconTypeProps {
	type?: 'primary' | 'secondary' | 'tertiary' | 'error'
}
