import React from 'react'
import renderer from 'react-test-renderer'

import { TestProvider } from '@berty-tech/testutil'

import ThemeColorName from '../ThemeColorName'

test('ThemeColorName modal renders correctly', () => {
	const props: React.ComponentProps<typeof ThemeColorName> = {
		closeModal: () => {},
	}
	const tree = renderer
		.create(
			<TestProvider>
				<ThemeColorName {...props} />
			</TestProvider>,
		)
		.toJSON()
	expect(tree).toMatchSnapshot()
})
