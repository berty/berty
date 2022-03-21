import React from 'react'

import { Layout } from '@ui-kitten/components'
import { StatusBar } from 'react-native'

import { ScreenFC } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'

import { WebViews } from '../shared-components'

export const Roadmap: ScreenFC<'Settings.Roadmap'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<StatusBar barStyle='light-content' />
			<WebViews url='https://guide.berty.tech/roadmap' />
		</Layout>
	)
}
