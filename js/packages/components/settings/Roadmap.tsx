import React from 'react'
import { StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'

import { useThemeColor } from '@berty-tech/store'
import { ScreenFC } from '@berty-tech/navigation'

import { WebViews } from '../shared-components'

export const Roadmap: ScreenFC<'Settings.Roadmap'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<WebViews url='https://guide.berty.tech/roadmap' />
		</Layout>
	)
}
