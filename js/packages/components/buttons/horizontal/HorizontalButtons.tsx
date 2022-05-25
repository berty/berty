import React, { ReactNode } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface IHorizontalButtonsProps {
	children: ReactNode[]
}

const HorizontalButtons: React.FC<IHorizontalButtonsProps> = props => {
	const { row, margin } = useStyles()

	return (
		<View style={row.center}>
			<View style={[{ flex: 1 }, margin.right.large]}>{props.children[0]}</View>
			<View style={[{ flex: 1 }, margin.left.large]}>{props.children[1]}</View>
		</View>
	)
}

export default HorizontalButtons
