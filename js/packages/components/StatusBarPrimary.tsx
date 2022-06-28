import React from 'react'
import { StatusBar } from 'react-native'

import { useThemeColor } from '@berty/hooks'

export const StatusBarPrimary: React.FC = () => {
	const colors = useThemeColor()
	return <StatusBar backgroundColor={colors['main-background']} barStyle='dark-content' />
}
