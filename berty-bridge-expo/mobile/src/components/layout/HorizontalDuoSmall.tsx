import React, { ReactNode } from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

interface HorizontalDuoSmallProps {
	children: ReactNode[]
}

export const HorizontalDuoSmall: React.FC<HorizontalDuoSmallProps> = props => {
	const { row, margin } = useStyles()

	return (
		<View style={row.center}>
			<View style={[{ flex: 1 }, margin.right.small]}>{props.children[0]}</View>
			<View style={[{ flex: 1 }, margin.left.small]}>{props.children[1]}</View>
		</View>
	)
}
