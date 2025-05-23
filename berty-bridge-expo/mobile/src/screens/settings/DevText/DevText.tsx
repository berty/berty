import React from 'react'
import { ScrollView } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { ScreenFC } from '@berty/navigation'

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
