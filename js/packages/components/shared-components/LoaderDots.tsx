import React from 'react'
import { View, Image } from 'react-native'

import source from './loader_dots.gif'

const LoaderDots: React.FC = () => (
	<View
		style={{
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%',
			width: '100%',
			backgroundColor: 'white', // FIXME: use correct background color here and in gif
		}}
	>
		<Image source={source} style={{ width: 170, height: 80 }} />
	</View>
)

export default LoaderDots
