import React from 'react'
import { ScrollView } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { ScreenFC } from '@berty/navigation'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

export const DevText: ScreenFC<'Settings.DevText'> = ({
	route: {
		params: { text },
	},
}) => {
	const topInset = useTopInset()
	return (
		<ScrollView contentContainerStyle={{ paddingTop: topInset }}>
			<UnifiedText selectable={true}>{text}</UnifiedText>
		</ScrollView>
	)
}
