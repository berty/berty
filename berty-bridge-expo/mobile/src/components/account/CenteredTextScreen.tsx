import React from 'react'
import { StatusBar } from 'react-native'

import { FlexCenterViewPriv } from '../flex'
import { UnifiedText } from '../shared-components/UnifiedText'

export const CenteredTextScreen: React.FC = ({ children }) => {
	return (
		<>
			<StatusBar barStyle='dark-content' />
			<FlexCenterViewPriv>
				<UnifiedText>{children}</UnifiedText>
			</FlexCenterViewPriv>
		</>
	)
}
