import React from 'react'
import { View } from 'react-native'

const BlurView: React.FC<{ blurAmount: number; style: any }> = ({
	children,
	blurAmount = 10,
	style,
}) => (
	<View style={[{ backgroundColor: 'white', opacity: 1 - blurAmount / 100 }, style]}>
		{children}
	</View>
)

export default BlurView
