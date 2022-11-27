import { Icon } from '@ui-kitten/components'
import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export function IconWrapper(): JSX.Element {
	const { row, column, height, width, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				column.justify,
				height(52),
				width(52),
				border.radius.scale(52 / 2),
				{ backgroundColor: '#EAEAFB' },
			]}
		>
			<Icon
				name='camera-outline'
				height={20}
				width={20}
				fill={colors['background-header']}
				style={row.item.justify}
			/>
		</View>
	)
}
