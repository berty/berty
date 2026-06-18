import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

import { WebViews } from '@berty/components/shared-components'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

const RoadmapURL = 'https://guide.berty.tech/roadmap'

export const Roadmap: ScreenFC<'Settings.Roadmap'> = () => {
	const colors = useThemeColor()
	const topInset = useTopInset()

	return (
		<View style={{ backgroundColor: colors['main-background'], minHeight: '100%', paddingTop: topInset }}>
			<StatusBar style='light' />
			<WebViews url={RoadmapURL} />
		</View>
	)
}
