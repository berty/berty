export interface ButtonPressProps {
	onPress?: () => void
}

export interface ButtonDefProps extends ButtonPressProps {
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
