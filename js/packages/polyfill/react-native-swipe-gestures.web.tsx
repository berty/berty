import React from 'react'
import { View } from 'react-native'

export const GestureRecognizer: React.FC<{ style: any }> = ({ children, style }) => (
	<View style={style}>{children}</View>
)
export default GestureRecognizer
