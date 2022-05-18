import React, { ReactNode } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface IHorizontalButtonsProps {
	children: ReactNode[]
}

const HorizontalButtons: React.FC<IHorizontalButtonsProps> = props => {
	const { row, padding, margin } = useStyles()

	return (
		<View style={[row.center, padding.top.medium, margin.horizontal.big]}>
			<View style={[{ flex: 1 }, margin.right.small]}>{props.children[0]}</View>
			<View style={[{ flex: 1 }, margin.left.small]}>{props.children[1]}</View>
		</View>
	)
}

export default HorizontalButtons
