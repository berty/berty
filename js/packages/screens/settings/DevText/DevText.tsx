import React from 'react'
import { ScrollView } from 'react-native'

import { ScreenFC } from '@berty/navigation'
import { UnifiedText } from '../../../components/shared-components/UnifiedText'

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
