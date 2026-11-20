import React from 'react'
import { StatusBar } from 'react-native'

import { useIsDarkTheme } from '@berty/hooks'

import { FlexCenterViewPriv } from '../flex'
import { UnifiedText } from '../shared-components/UnifiedText'

export const CenteredTextScreen: React.FC = ({ children }) => {
	const isDark = useIsDarkTheme()
	return (
		<>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
			<FlexCenterViewPriv>
				<UnifiedText>{children}</UnifiedText>
			</FlexCenterViewPriv>
		</>
	)
}
