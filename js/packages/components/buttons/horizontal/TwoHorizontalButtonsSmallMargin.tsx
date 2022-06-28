import React, { ReactNode } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface TwoHorizontalButtonsSmallMarginProps {
	children: ReactNode[]
}

export const TwoHorizontalButtonsSmallMargin: React.FC<TwoHorizontalButtonsSmallMarginProps> =
	props => {
		const { row, margin } = useStyles()

		return (
			<View style={row.center}>
				<View style={[{ flex: 1 }, margin.right.small]}>{props.children[0]}</View>
				<View style={[{ flex: 1 }, margin.left.small]}>{props.children[1]}</View>
			</View>
		)
	}
