import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const RoadmapURL = 'https://guide.berty.tech/roadmap'

export const Roadmap: ScreenFC<'Settings.Roadmap'> = () => {
	const colors = useThemeColor()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%' }}>
			<StatusBar style='light' />
			<WebViews url={RoadmapURL} />
		</View>
	)
}
