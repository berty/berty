export interface ButtonDefProps {
	onPress?: () => void
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
