export interface IButtonPress {
	onPress: () => void
	loading?: boolean
}

export interface IIconName {
	// TODO: check how to use this with a type
	/**
	 * @default 'checkmark-outline'
	 */
	name?: string
}
