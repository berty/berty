import React from 'react'
import { ScrollView } from 'react-native'

import { ScreenFC } from '@berty/navigation'
import { BText } from '../shared-components/BText'

export const DevText: ScreenFC<'Settings.DevText'> = ({
	route: {
		params: { text },
	},
}) => {
	return (
		<ScrollView>
			<BText selectable={true}>{text}</BText>
		</ScrollView>
	)
}
