import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store'
import { ScreenFC } from '@berty/navigation'

import { WebViews } from '@berty/components/shared-components'

const RoadmapURL = 'https://guide.berty.tech/roadmap'

export const Roadmap: ScreenFC<'Settings.Roadmap'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='light-content' />
			<WebViews url={RoadmapURL} />
		</Layout>
	)
}
