import React from 'react'
import { View, Image } from 'react-native'

import { useThemeColor } from '@berty-tech/store/hooks'

import source from './loader_dots.gif'

const LoaderDots: React.FC = () => {
	const colors = useThemeColor()

	return (
		<View
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				width: '100%',
				backgroundColor: colors['main-background'],
			}}
		>
			<Image source={source} style={{ width: 170, height: 80 }} />
		</View>
	)
}

export default LoaderDots
