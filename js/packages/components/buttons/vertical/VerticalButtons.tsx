import React from 'react'
import { View } from 'react-native'

import { PrimaryButton } from '../primary/PrimaryButton'
import { SecondaryButton } from '../secondary/SecondaryButton'

interface VerticalButtonsProps {
	onPressTop: () => void
	onPressBottom: () => void
	children: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VerticalButtons: React.FC<VerticalButtonsProps> = props => {
	return (
		<View>
			<PrimaryButton onPress={props.onPressTop}>{props.children[0]}</PrimaryButton>
			<SecondaryButton onPress={props.onPressBottom}>{props.children[1]}</SecondaryButton>
		</View>
	)
}
