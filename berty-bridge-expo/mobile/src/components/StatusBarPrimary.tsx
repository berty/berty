import React from 'react'
import { StatusBar } from 'react-native'

import { useIsDarkTheme } from '@berty/hooks'

export const StatusBarPrimary: React.FC = () => {
	const isDark = useIsDarkTheme()
	return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
}
