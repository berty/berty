import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty-tech/styles'

import { useThemeColor } from '@berty-tech/store/hooks'

const BAR_LENGTH = 12
const CHUNK_LENGTH = 2

export const Visualizer: React.FC<{
	data: any[]
	recordDuration: number | null
}> = ({ data }) => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					alignItems: 'center',
					height: 50,
					position: 'absolute',
					right: 74 * scaleSize,
					top: -5 * scaleSize,
					flexDirection: 'row',
				},
			]}
		>
			{data.slice(-CHUNK_LENGTH * BAR_LENGTH).map((item, index) => (
				<View
					key={index}
					style={{
						height: 40 - 9 * Math.log(-item) * scaleSize,
						backgroundColor: `${colors['background-header']}90`,
						width: 4 * scaleSize,
						borderRadius: 4,
						marginHorizontal: 1.5,
					}}
				/>
			))}
		</View>
	)
}
