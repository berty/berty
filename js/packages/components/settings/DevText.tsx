import React from 'react'
import { ScrollView } from 'react-native'

import { ScreenFC } from '@berty/navigation'
import { UnifiedText } from '../shared-components/UnifiedText'

export const DevText: ScreenFC<'Settings.DevText'> = ({
	route: {
		params: { text },
	},
}) => {
	return (
		<ScrollView>
			<UnifiedText selectable={true}>{text}</UnifiedText>
		</ScrollView>
	)
}
