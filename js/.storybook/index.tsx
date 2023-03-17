import React from 'react'
import { mockServices } from '../packages/utils/testing/mockServices.test'

import StorybookUIRoot from './Storybook'

mockServices()

const App: React.FC = () => {
	return <StorybookUIRoot />
}

export default App
