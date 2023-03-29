import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text } from 'react-native'
import { mockServices } from '../packages/utils/testing/mockServices.test'
import StorybookUIRoot from './Storybook'

const App: React.FC = () => {
	const [mockStarted, setMockStarted] = useState(false)

	useEffect(() => {
		async function init() {
			await mockServices()
			setMockStarted(true)
		}

		init()
	}, [])

	if (!mockStarted) {
		return (
			<SafeAreaView>
				<Text>Loading...</Text>
			</SafeAreaView>
		)
	}

	return <StorybookUIRoot />
}

export default App
