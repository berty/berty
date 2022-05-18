import React from 'react'
import { View } from 'react-native'

import PrimaryButton from '../primary/PrimaryButton'
import SecondaryButton from '../secondary/SecondaryButton'

interface IVerticalButtonsProps {
	onPressTop: () => void
	onPressBottom: () => void
	children: string[]
}

const VerticalButtons: React.FC<IVerticalButtonsProps> = props => {
	return (
		<View>
			<PrimaryButton onPress={props.onPressTop}>{props.children[0]}</PrimaryButton>
			<SecondaryButton onPress={props.onPressBottom}>{props.children[1]}</SecondaryButton>
		</View>
	)
}

export default VerticalButtons
