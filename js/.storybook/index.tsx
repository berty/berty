import React from 'react'
import { useFonts } from '../packages/messenger-app/fonts-loader'
import { mockServices } from '../packages/utils/testing/mockServices.test'

import StorybookUIRoot from './Storybook'

mockServices()

const App: React.FC = () => {
	const { isFontLoaded } = useFonts()

	if (!isFontLoaded) {
		return null
	}

	return <StorybookUIRoot />
}

export default App
